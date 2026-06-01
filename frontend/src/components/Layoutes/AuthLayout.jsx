import TaskJourney from "../../assets/Task-Journey-1-nobg.png";
import TasklyLogoSmall from "../../../public/Taskly-small.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden md:block lg:w-4/6">
        <img src={TaskJourney} alt="background" />
      </div>
      <div className="p-5 w-full lg:w-2/6 flex flex-col">
        <img src={TasklyLogoSmall} alt="logo" className="w-30 h-10" />
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
