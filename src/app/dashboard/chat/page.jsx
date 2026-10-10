import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";
const dynamic = "force-dynamic";
async function ChatPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return <ChatClient currentUserId={session.id} />;
}
export {
  ChatPage as default,
  dynamic
};
