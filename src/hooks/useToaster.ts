import { useAppDispatch } from '~/store/hooks';
import { add, remove, Toast, TTL } from '~/store/slices/toasts';
import { queueJob, uuidGen } from '~/utils';

const uuid = uuidGen();

type RawToast = Omit<Toast, 'id'>;

const useToaster = (payload: RawToast) => {
    const dispatch = useAppDispatch();

    const toast = (on_the_fly_payload?: Partial<RawToast>) => {
        const id = uuid();

        dispatch(
            add({
                ...payload,
                ...on_the_fly_payload,
                id,
            })
        );

        queueJob(() => {
            dispatch(remove(id));
        }, payload.ttl ?? TTL);
    };

    return toast;
};

export default useToaster;
