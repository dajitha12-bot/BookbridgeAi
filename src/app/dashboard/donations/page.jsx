import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getAllDonationRequests } from "../../../lib/db/donations";
import { getAllBooks } from "../../../lib/db/books";
import DonationPortalClient from "./DonationPortalClient";
const dynamic = "force-dynamic";
async function DonationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const allRequests = await getAllDonationRequests();
  const allBooks = await getAllBooks();
  const freeBooksPool = allBooks.filter((b) => b.donationAvailable && b.status === "AVAILABLE");
  const userDonationBooks = allBooks.filter((b) => b.ownerId === session.id && b.donationAvailable && b.status === "AVAILABLE");
  return <DonationPortalClient
    userId={session.id}
    userName={session.name}
    initialRequests={allRequests}
    freeBooksPool={freeBooksPool}
    userDonationBooks={userDonationBooks}
  />;
}
export {
  DonationsPage as default,
  dynamic
};
