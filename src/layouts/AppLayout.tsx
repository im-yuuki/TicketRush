import { Outlet } from "react-router";
import Footer from "../components/Footer.tsx";
import NavBar from "../components/NavBar.tsx";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@heroui/react";
import { ArrowUp } from "lucide-react";

export default function AppLayout() {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div className="min-h-dvh">
      <NavBar className="w-full border-b-2 border-border" ref={ref} />
      <motion.div
        initial={false}
        animate={{
          y: inView ? -80 : 0,
          opacity: inView ? 0 : 1
        }}
        transition={{ duration: inView ? 0 : 0.3 }}
        className="fixed top-0 left-0 w-full z-50"
      >
        <NavBar
          className="mx-2 mt-2 border-2 border-border rounded-full bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg" />
      </motion.div>
      <main className="container mx-auto">
        <Outlet />
      </main>
      <Footer className="border-t-2 border-border" />
      <motion.div
        initial={false}
        animate={{
          x: inView ? 80 : 0,
          opacity: inView ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 right-0 z-50 m-5"
      >
      <Button className="shadow-lg" size="lg" variant="tertiary" isIconOnly={true} onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}>
        <ArrowUp />
      </Button>
      </motion.div>
    </div>
  );
}
