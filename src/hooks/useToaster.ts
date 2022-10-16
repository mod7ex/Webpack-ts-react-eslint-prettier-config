import { useAppDispatch } from '~/store/hooks';
import { add, Toast, scheduleRemoveThunk } from '~/store/slices/toasts';
import { uuidGen } from '~/utils';

const uuid = uuidGen('toasts');

type RawToast = Partial<Omit<Toast, 'id'>>;

const useToaster = (payload: RawToast) => {
    const dispatch = useAppDispatch();

    return (on_the_fly_payload?: RawToast) => {
        const id = uuid();

        dispatch(
            add({
                ...payload,
                ...on_the_fly_payload,
                id,
            })
        );

        const ttl = payload.ttl ?? on_the_fly_payload?.ttl;

        dispatch(scheduleRemoveThunk({ id, ttl }));
    };
};

export default useToaster;
