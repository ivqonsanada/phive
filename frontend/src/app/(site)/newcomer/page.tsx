import { redirect } from "next/navigation";

/** The original redirected the bare path to step one; so does this. */
export default function NewcomerIndex() {
  redirect("/newcomer/1");
}
