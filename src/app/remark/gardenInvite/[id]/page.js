
import GardenInviteRemarkUI from './pageUI';

export const revalidate = 0;
export async function GardenInviteRemark({ params }) {
  const { id } = await params;
  return <GardenInviteRemarkUI id={id} />;
}

export default GardenInviteRemark;

