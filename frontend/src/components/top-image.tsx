/**
 * The original's `TopImage`: a photographic band with the PHive mark centred on it,
 * used as the header of the settings and edit-profile pages. Two artworks, picked by
 * type, exactly as the original.
 */
export function TopImage({ type = 1 }: { type?: 1 | 2 }) {
  return (
    <div className="mb-[25px] xl:mb-8">
      <div
        className={`my-5 h-[75px] rounded-[15px] bg-cover bg-no-repeat xl:h-[100px] ${
          type === 1 ? "bg-[url('/images/top-img-1.png')]" : "bg-[url('/images/top-img-2.png')]"
        }`}
      >
        <div className="h-[75px] bg-[url('/images/logo.svg')] bg-[length:57px] bg-center bg-no-repeat xl:h-[100px] xl:bg-[length:87px]" />
      </div>
    </div>
  );
}
