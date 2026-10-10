import { getAllBooks } from "../db/books";
import { getAllBookRequests } from "../db/bookRequests";
import { getUserById } from "../db/users";
async function findSwapChains() {
  const allBooks = await getAllBooks();
  const books = allBooks.filter((b) => b.status === "AVAILABLE" && b.exchangeAvailable);
  const requests = await getAllBookRequests();
  const activeRequests = requests.filter((r) => r.status === "ACTIVE");
  const userRequests = /* @__PURE__ */ new Map();
  for (const req of activeRequests) {
    if (!userRequests.has(req.requesterId)) {
      userRequests.set(req.requesterId, []);
    }
    userRequests.get(req.requesterId).push(req);
  }
  const nodes = [];
  for (const book of books) {
    const reqs = userRequests.get(book.ownerId) || [];
    const owner = await getUserById(book.ownerId);
    for (const req of reqs) {
      nodes.push({
        userId: book.ownerId,
        userName: owner?.name || "Unknown Reader",
        offeredBookId: book.id,
        offeredBookTitle: book.title,
        offeredBookCategory: book.category,
        requestedCategory: req.category
      });
    }
  }
  const adj = /* @__PURE__ */ new Map();
  for (let i = 0; i < nodes.length; i++) {
    adj.set(i, []);
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      if (nodes[i].userId !== nodes[j].userId && nodes[i].offeredBookCategory.toLowerCase() === nodes[j].requestedCategory.toLowerCase()) {
        adj.get(i).push(j);
      }
    }
  }
  const cycles = [];
  const visited = /* @__PURE__ */ new Set();
  const path = [];
  function dfs(u, start) {
    visited.add(u);
    path.push(u);
    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (v === start) {
        if (path.length >= 3) {
          const userIdsInPath = path.map((idx) => nodes[idx].userId);
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
                requestedBookTitle: nodes[nextIdx].offeredBookTitle
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
  const uniqueCycles = [];
  const seenSignatures = /* @__PURE__ */ new Set();
  for (const cycle of cycles) {
    const bookIds = cycle.members.map((m) => m.offeredBookId).sort();
    const signature = bookIds.join("-");
    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      uniqueCycles.push(cycle);
    }
  }
  return uniqueCycles;
}
export {
  findSwapChains
};
