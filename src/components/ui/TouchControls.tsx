import './TouchControls.css';

type TouchAction =
    | 'forward'
    | 'left'
    | 'right'
    | 'fire'
    | 'lateral';

function dispatchTouchAction(action: TouchAction, pressed: boolean) {
    window.dispatchEvent(
        new CustomEvent('game:touch-input', {
            detail: { action, pressed },
        }),
    );
}

interface TouchButtonProps {
    action: TouchAction;
    label: string;
    hold?: boolean;
}

function TouchButton({ action, label, hold = true }: TouchButtonProps) {
    return (
        <button
            className="touch-controls__button"
            type="button"
            onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                dispatchTouchAction(action, true);
                if (!hold) {
                    dispatchTouchAction(action, false);
                }
            }}
            onPointerUp={(event) => {
                event.preventDefault();
                dispatchTouchAction(action, false);
            }}
            onPointerCancel={() => dispatchTouchAction(action, false)}
            onPointerLeave={() => {
                if (hold) {
                    dispatchTouchAction(action, false);
                }
            }}
        >
            {label}
        </button>
    );
}

export function TouchControls() {
    return (
        <div className="touch-controls" role="group" aria-label="Touch controls">
            <TouchButton action="left" label="Turn Left" />
            <TouchButton action="forward" label="Forward" />
            <TouchButton action="right" label="Turn Right" />
            <TouchButton action="fire" label="Fire" hold={false} />
            <TouchButton action="lateral" label="Side Fire" hold={false} />
        </div>
    );
}
