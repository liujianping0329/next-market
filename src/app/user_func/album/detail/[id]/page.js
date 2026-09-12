import AlbumDetail from "@/app/user_func/album/_component/detail/AlbumDetail";

export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({ params }) {
    const { id } = await params;

    return <AlbumDetail id={id} backHref="/user_func/album" />;
}
