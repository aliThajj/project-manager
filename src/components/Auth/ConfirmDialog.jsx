import { useContext, useState } from "react";
import { ModalContext } from '../../context/ModalContext';
import Modal from "../UI/Modal";
import Button from "../UI/Button";

export default function ConfirmDialog({ modalID, icon, caption, description, action, onHandleAction }) {
    const { closeDialog } = useContext(ModalContext);
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async () => {
        setIsLoading(true);
        try {
            await onHandleAction(); // excute Function
            closeDialog(modalID); // Close dialog after successful action

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal id={modalID}>
            <div className="md:flex items-center">
                <div className="rounded-full border border-gray-300 flex items-center justify-center w-16 h-16 flex-shrink-0 mx-auto">
                    {icon}
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                    <p className="font-bold">{caption}</p>
                    <p className="text-sm text-gray-700 mt-1">{description}</p>
                </div>
            </div>
            <div className="text-center md:text-right mt-4 md:flex md:justify-end">
                <Button
                    danger={true}
                    isLoading={isLoading}
                    onClick={handleAction}>
                    {action}
                </Button>
                <button
                    onClick={() => closeDialog(modalID)}
                    className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1"
                    disabled={isLoading}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
}