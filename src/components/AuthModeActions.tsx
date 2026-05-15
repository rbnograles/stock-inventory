/**
 * Renders the compact mode-switch controls at the bottom of the auth screen.
 * Separating these buttons keeps login, signup, and reset-password navigation
 * easy to change without bloating the form component.
 */
type AuthMode = "sign-in" | "sign-up" | "reset-password";

interface AuthModeActionsProps {
  mode: AuthMode;
  onClearMessages: () => void;
  onModeChange: (mode: AuthMode | ((current: AuthMode) => AuthMode)) => void;
}

export const AuthModeActions = ({
  mode,
  onClearMessages,
  onModeChange,
}: AuthModeActionsProps) => {
  const isSignUp = mode === "sign-up";
  const isPasswordReset = mode === "reset-password";

  return (
    <div className="space-y-3 text-center">
      <button
        type="button"
        className="w-full text-sm font-bold text-teal-700 dark:text-teal-300"
        onClick={() => {
          onModeChange((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          onClearMessages();
        }}
      >
        {isSignUp || isPasswordReset ? "Back to sign in" : "Need an account? Create one"}
      </button>
      {!isSignUp && !isPasswordReset ? (
        <button
          type="button"
          className="w-full text-sm font-bold text-slate-600 dark:text-slate-300"
          onClick={() => {
            onModeChange("reset-password");
            onClearMessages();
          }}
        >
          Forgot password?
        </button>
      ) : null}
    </div>
  );
};
