import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function ApiDocPage() {
  const spec = getApiDocs();

  return <ReactSwagger spec={spec} />;
}