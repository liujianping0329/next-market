import GreengrassDetail from "../_component/detail/GreengrassDetail";

export async function GreengrassDetailPage({ params }) {
  return <GreengrassDetail id={params.id} />;
}
export default GreengrassDetailPage;