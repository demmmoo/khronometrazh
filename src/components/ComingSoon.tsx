import { EmptyState } from "./ui";

export function ComingSoon({ title }: { title: string }) {
  return (
    <EmptyState title={title} description="Этот раздел дорабатывается — скоро здесь появится полный функционал." />
  );
}
