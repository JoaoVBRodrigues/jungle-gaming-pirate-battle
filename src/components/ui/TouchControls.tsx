import './TouchControls.css';

type TouchAction =
    | 'forward'
    | 'left'
    | 'right'
    | 'fire'
    | 'fire-left'
    | 'fire-right';

const controlIcons = {
    forward: new URL(
        '../../../assets/png/retina/ui/controls/icon_forward.png',
        import.meta.url,
    ).href,
    left: new URL(
        '../../../assets/png/retina/ui/controls/icon_turn_left.png',
        import.meta.url,
    ).href,
    right: new URL(
        '../../../assets/png/retina/ui/controls/icon_turn_right.png',
        import.meta.url,
    ).href,
    fire: new URL(
        '../../../assets/png/retina/ui/controls/icon_fire_front.png',
        import.meta.url,
    ).href,
    fireLeft: new URL(
        '../../../assets/png/retina/ui/controls/icon_fire_left.png',
        import.meta.url,
    ).href,
    fireRight: new URL(
        '../../../assets/png/retina/ui/controls/icon_fire_right.png',
        import.meta.url,
    ).href,
} as const;

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
    icon: string;
    hold?: boolean;
}

function TouchButton({ action, label, icon, hold = true }: TouchButtonProps) {
    return (
        <button
            className="touch-controls__button"
            type="button"
            aria-label={label}
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
            <img src={icon} alt="" aria-hidden="true" />
            <span className="touch-controls__label">{label}</span>
        </button>
    );
}

export function TouchControls() {
    return (
        <div className="touch-controls" role="group" aria-label="Touch controls">
            <TouchButton action="left" label="Turn Left" icon={controlIcons.left} />
            <TouchButton action="forward" label="Forward" icon={controlIcons.forward} />
            <TouchButton action="right" label="Turn Right" icon={controlIcons.right} />
            <TouchButton action="fire" label="Fire" icon={controlIcons.fire} hold={false} />
            <TouchButton action="fire-left" label="Left Fire" icon={controlIcons.fireLeft} hold={false} />
            <TouchButton action="fire-right" label="Right Fire" icon={controlIcons.fireRight} hold={false} />
        </div>
    );
}
