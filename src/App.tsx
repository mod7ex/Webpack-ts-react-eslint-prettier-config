import { useState, useRef, forwardRef, type MutableRefObject } from 'react';
import classes from './local.module.scss';
import { SwitchTransition, CSSTransition, Transition, type TransitionStatus } from 'react-transition-group';

const Comp = forwardRef<HTMLParagraphElement, { className: `fade-${TransitionStatus}` }>((props, ref) => {
    return (
        <p ref={ref} className={`${props.className} ${classes.paragraph}`}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi expedita labore aut eveniet eum temporibus
            ducimus excepturi quo sint facilis.
        </p>
    );
});

const Fade = () => {
    const nodeRef = useRef() as MutableRefObject<HTMLParagraphElement>;

    const [visible, setVisible] = useState(true);

    return (
        <>
            <button onClick={() => setVisible((v) => !v)}>toggle</button>

            <Transition timeout={1000} nodeRef={nodeRef} in={visible}>
                {(state) => <Comp ref={nodeRef} className={`fade-${state}`} />}
            </Transition>
        </>
    );
};

function Switch() {
    const [state, setState] = useState(false);
    const helloRef = useRef() as MutableRefObject<HTMLButtonElement>;
    const goodbyeRef = useRef() as MutableRefObject<HTMLButtonElement>;
    const nodeRef = state ? goodbyeRef : helloRef;
    return (
        <SwitchTransition mode="out-in">
            <CSSTransition
                timeout={1500}
                key={state ? 'Goodbye, world!' : 'Hello, world!'}
                nodeRef={nodeRef}
                addEndListener={(done) => nodeRef.current!.addEventListener('transitionend', done, false)}
                classNames="switch"
            >
                <button ref={nodeRef} onClick={() => setState((state) => !state)}>
                    {state ? 'Goodbye, world!' : 'Hello, world!'}
                </button>
            </CSSTransition>
        </SwitchTransition>
    );
}

const App = () => {
    // return <Fade />;
    return <Switch />;
};

export default App;
