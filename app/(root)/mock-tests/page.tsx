import Container from "@/components/container";
import AllTests from "@/components/client-tests/all-tests";

export default function MockTests() {
  return (
    <Container className="flex flex-col gap-5 md:gap-12 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 text-left md:text-center mx-auto max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-black tracking-tight">
            Master the Waves with{" "}
            <span className="text-brand-primary">Precision</span>
          </h1>
          <p className="text-brand-muted/90 font-sans text-base md:text-lg leading-relaxed mx-auto">
            Experience high-fidelity maritime entrance exam simulations. Our
            tests are meticulously crafted to mirror actual company patterns,
            providing you with the competitive edge needed to secure your rank.
          </p>
        </div>
      </div>
      <AllTests />
    </Container>
  );
}
