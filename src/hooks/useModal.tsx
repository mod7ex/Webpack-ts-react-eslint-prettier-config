import React, { useState } from 'react';
import Modal from '~/components/Modal';

export default function useModal(cb: TFunction, props: React.ComponentProps<typeof Modal>) {
    const [up, setUp] = useState(false);

    const InnerModal = <>{up && <Modal {...props} />}</>;

    return [InnerModal, setUp];
}
