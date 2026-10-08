import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Composer from "../components/Composer.jsx";
import SlideIn from "../components/SlideIn.jsx";

export default function Compose() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -m-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-md">Create post</h1>
      </div>

      <SlideIn variant="up">
        <Composer onPosted={() => navigate("/")} />
      </SlideIn>
    </div>
  );
}
