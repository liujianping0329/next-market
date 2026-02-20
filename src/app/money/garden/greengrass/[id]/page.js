import GreengrassDetail from "../_component/detail/GreengrassDetail";

export async function GreengrassDetailPage({ params }) {
  console.log("params1:", params);
  return <GreengrassDetail id={params.id} showToolbar={false} />;
}
export default GreengrassDetailPage;