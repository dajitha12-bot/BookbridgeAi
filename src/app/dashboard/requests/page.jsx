import { getSession } from "../../../lib/auth/session";
import { getRequestsByUser } from "../../../lib/db/bookRequests";
import { getAllBooks } from "../../../lib/db/books";
import { getUserById } from "../../../lib/db/users";
import RequestsClient from "../../../components/dashboard/RequestsClient";
import { redirect } from "next/navigation";
const dynamic = "force-dynamic";
async function RequestsPage({
  searchParams
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { newTitle } = await searchParams;
  const requests = await getRequestsByUser(session.id);
  requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const allBooks = await getAllBooks();
  const availableBooks = allBooks.filter((b) => b.status === "AVAILABLE" && b.ownerId !== session.id);
  const booksWithSellers = await Promise.all(
    availableBooks.map(async (b) => {
      const seller = await getUserById(b.ownerId);
      return {
        ...b,
        seller: seller ? { id: seller.id, name: seller.name } : null
      };
    })
  );
  return <RequestsClient
    initialRequests={requests}
    prefilledTitle={newTitle || ""}
    availableBooks={booksWithSellers}
  />;
}
export {
  RequestsPage as default,
  dynamic
};
