import { getAllBooks } from '../db/books';
import { getAllBookRequests } from '../db/bookRequests';
import { getUserById } from '../db/users';

export interface SwapChainNode {
  userId: string;
  userName: string;
  offeredBookId: string;
  offeredBookTitle: string;
  offeredBookCategory: string;
  requestedCategory: string;
}

export interface SwapChainPath {
  members: {
    userId: string;
    userName: string;
    offeredBookId: string;
    offeredBookTitle: string;
    requestedBookId: string;
    requestedBookTitle: string;
  }[];
}

/**
 * Finds multi-user book exchange chains (cycles of length >= 3) in the system.
 */
export async function findSwapChains(): Promise<SwapChainPath[]> {
  // 1. Fetch all available books that can be exchanged
  const allBooks = await getAllBooks();
  const books = allBooks.filter(b => b.status === 'AVAILABLE' && b.exchangeAvailable);

  // 2. Fetch all active book requests
  const requests = await getAllBookRequests();
  const activeRequests = requests.filter(r => r.status === 'ACTIVE');

  // 3. Map requests by user for fast lookup
  const userRequests = new Map<string, typeof activeRequests>();
  for (const req of activeRequests) {
    if (!userRequests.has(req.requesterId)) {
      userRequests.set(req.requesterId, []);
    }
    userRequests.get(req.requesterId)!.push(req);
  }

  // 4. Construct nodes: Users who have a book and want another category
  const nodes: SwapChainNode[] = [];
  for (const book of books) {
    const reqs = userRequests.get(book.ownerId) || [];
    const owner = await getUserById(book.ownerId);
    
    for (const req of reqs) {
      nodes.push({
        userId: book.ownerId,
        userName: owner?.name || 'Unknown Reader',
        offeredBookId: book.id,
        offeredBookTitle: book.title,
        offeredBookCategory: book.category,
        requestedCategory: req.category,
      });
    }
  }

  // 5. Build adjacency list for the graph
  const adj = new Map<number, number[]>(); // Indexes of nodes
  for (let i = 0; i < nodes.length; i++) {
    adj.set(i, []);
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      
      // Node i offers a book that matches Node j's request category
      // And they must be different users
      if (
        nodes[i].userId !== nodes[j].userId &&
        nodes[i].offeredBookCategory.toLowerCase() === nodes[j].requestedCategory.toLowerCase()
      ) {
        adj.get(i)!.push(j);
      }
    }
  }

  const cycles: SwapChainPath[] = [];
  const visited = new Set<number>();
  const path: number[] = [];

  function dfs(u: number, start: number) {
    visited.add(u);
    path.push(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (v === start) {
        // Cycle found!
        if (path.length >= 3) {
          const userIdsInPath = path.map(idx => nodes[idx].userId);
          const uniqueUsers = new Set(userIdsInPath);
          
          if (uniqueUsers.size === path.length) {
            const members = [];
            for (let k = 0; k < path.length; k++) {
              const currentIdx = path[k];
              const nextIdx = path[(k + 1) % path.length];
              
              members.push({
                userId: nodes[currentIdx].userId,
                userName: nodes[currentIdx].userName,
                offeredBookId: nodes[currentIdx].offeredBookId,
                offeredBookTitle: nodes[currentIdx].offeredBookTitle,
                requestedBookId: nodes[nextIdx].offeredBookId,
                requestedBookTitle: nodes[nextIdx].offeredBookTitle,
              });
            }
            cycles.push({ members });
          }
        }
      } else if (!visited.has(v)) {
        dfs(v, start);
      }
    }

    path.pop();
    visited.delete(u);
  }

  for (let i = 0; i < nodes.length; i++) {
    dfs(i, i);
  }

  const uniqueCycles: SwapChainPath[] = [];
  const seenSignatures = new Set<string>();

  for (const cycle of cycles) {
    const bookIds = cycle.members.map(m => m.offeredBookId).sort();
    const signature = bookIds.join('-');
    
    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      uniqueCycles.push(cycle);
    }
  }

  return uniqueCycles;
}
