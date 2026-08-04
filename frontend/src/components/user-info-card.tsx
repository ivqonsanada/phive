import { Avatar } from "@/components/avatar";
import { Icon } from "@/lib/icons";
import type { User } from "@/lib/types";

/**
 * The original's `.inbox__info--container`: a card of who you are, beside the list.
 *
 * The inbox and the party pages both show it, with identical markup in the original.
 *
 * It reflows three ways — stacked on a phone, photo-beside-text once there is room, and
 * back to stacked but centred as a fixed 280px rail on desktop.
 */
export function UserInfoCard({ user }: { user: User }) {
  return (
    <div className="mb-8 mt-2.5 flex flex-col items-center justify-center rounded-[20px] bg-mist px-2.5 py-5 shadow-[0_2px_6px_rgba(119,114,114,0.2)] sm:flex-row sm:py-[15px] sm:pl-[15px] sm:pr-[25px] xl:mb-0 xl:h-full xl:w-[280px] xl:flex-col xl:gap-4 xl:px-5 xl:py-6 xl:text-center">
      <Avatar
        src={user.photo_url}
        size={125}
        sizeClassName="size-[100px] xl:size-[125px]"
        className="mb-5 sm:mb-0 sm:mr-[30px] xl:mr-0"
        priority
      />

      <div>
        <p className="mb-[3px] text-[18px] font-semibold leading-[1.15] xl:text-[36px]">
          {user.name}
        </p>

        <p className="mb-[5px] leading-[1.45] text-[#757575] xl:text-[18px]">
          {user.major}
          <br />
          {user.university}
          <br />
          {user.location}
        </p>

        {user.expertise && (
          <p className="mb-[5px] flex items-center gap-[5px] font-semibold leading-[1.45] xl:justify-center xl:text-[18px]">
            {/* The icon is a mobile-only affordance in the original: on desktop the
                expertise sits under a centred name where it reads as a caption. */}
            <Icon
              icon="fa-solid:paint-brush"
              className="size-[15px] xl:hidden"
              aria-hidden
            />
            {user.expertise}
          </p>
        )}

        {user.role === "Student" ? (
          <p className="flex items-center gap-[5px] font-bold leading-[1.45] text-[#7ffa53] xl:justify-center xl:text-[18px]">
            <Icon icon="carbon:dot-mark" className="size-[15px] xl:size-[18px]" aria-hidden />
            Available
          </p>
        ) : (
          <p className="flex items-center gap-[5px] font-bold italic leading-[1.45] text-[#3051df] xl:justify-center xl:text-[18px]">
            <Icon icon="bi:shield-fill-check" className="size-[15px]" aria-hidden />
            Verified
          </p>
        )}
      </div>
    </div>
  );
}
