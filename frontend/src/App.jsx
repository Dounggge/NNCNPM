import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";

function App() {
  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-4xl font-bold">Test Tailwind</h1>
      <SignInForm />
      <SignUpForm />
    </div>
  );
}

export default App;