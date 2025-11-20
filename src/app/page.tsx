import WaybillWorkspace from "@/components/waybill/WaybillWorkspace";
import { getSessionUserFromCookies } from "@/lib/auth/session";

export default async function Home() {
  const sessionUser = await getSessionUserFromCookies();
  return <WaybillWorkspace user={sessionUser} />;
}
