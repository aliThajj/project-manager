import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useModal } from "../../context/ModalContext";

const Modal = ({ id, children }) => {
    const { modals, closeDialog } = useModal();
    const dialog = useRef(null);
    const isDialogOpen = modals[id] || false;

    useEffect(() => {
        if (isDialogOpen) {
            dialog.current?.showModal();
        } else {
            dialog.current?.close();
        }
    }, [isDialogOpen]);

    return createPortal(
        <dialog
            ref={dialog}
            className="backdrop:bg-stone-900/90 p-4 rounded-md shadow-md w-full lg:w-3/12">
            <div className="space-y-4">
                {children}
                {/* <button
                    type="button"
                    onClick={() => closeDialog(id)}
                    className="w-full text-stone-600 hover:text-stone-950">
                    Close
                </button> */}
            </div>
        </dialog>,
        document.getElementById("modal-root")
    );
};

export default Modal;
