import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h1
            className="text-6xl font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Allegro
          </h1>
          <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
            Made for music. Made for you.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
