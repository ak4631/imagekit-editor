import { Suspense } from "react";
import EditPage from "./EditPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPage />
    </Suspense>
  );
}
