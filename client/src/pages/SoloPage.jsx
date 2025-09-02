// src/pages/SoloPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import MagneticBoard from "../components/MagneticBoard";
import BoardFrame from "../components/BoardFrame";
import StampToolbar from "../components/StampToolbar";
import EraserSlider from "../components/EraserSlider";

const SoloPage = () => {
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center text-white p-4">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          &larr; Back to Menu
        </Link>
      </div>
      {/* We pass a 'null' socket to indicate it's an offline board */}
      <div className="flex-1 flex items-center justify-center">
      <BoardFrame
          canvas={<MagneticBoard socket={null} isDrawer={true} />}
          tools={
            true && (
              <>
                <StampToolbar />
                <EraserSlider />
              </>
            )
          }
        />
      </div>
    </div>
  );
};

export default SoloPage;
