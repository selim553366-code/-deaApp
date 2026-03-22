import { AIHelper } from "./AIHelper";
import { User } from "../types";

export const AIHelperModal = ({ onClose, user }: { onClose: () => void, user: User | null }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          Kapat
        </button>
        <AIHelper user={user} />
      </div>
    </div>
  );
};
