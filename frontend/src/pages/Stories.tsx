import StoriesSection from "@/components/stories/StoriesSection";
import AppShell from "@/components/layout/AppShell";

export default function Stories() {
  return (
    <AppShell title="Stories" subtitle="Sacred narratives and culture">
      <div className="py-2">
        <StoriesSection />
      </div>
    </AppShell>
  );
}
