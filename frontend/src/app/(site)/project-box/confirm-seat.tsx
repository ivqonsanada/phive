import { confirmSeat } from "@/app/actions/project-box";

export function ConfirmSeat({ boxId }: { boxId: number }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-navy/5 px-3 py-2.5">
      <p className="flex-1 text-sm text-navy">
        You&apos;ve been shortlisted. Confirm your seat so the lecturer can start.
      </p>

      <form action={confirmSeat.bind(null, boxId, true)}>
        <button
          type="submit"
          className="rounded-lg bg-navy px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          Confirm
        </button>
      </form>

      <form action={confirmSeat.bind(null, boxId, false)}>
        <button type="submit" className="text-sm font-semibold text-glow hover:underline">
          Bail out
        </button>
      </form>
    </div>
  );
}
