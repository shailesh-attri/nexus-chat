import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Oval } from "react-loader-spinner";
import axios from "axios";
import {
  loginRoute,
  EmailVerifyRoute,
  verify_otpRoute,
  ResetPasswordRoute,
} from "../../utils/APIRoutes";
import LogoText from '../../assets/LogoText.png'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../utils/AuthContext";
import N_logo from '../../assets/N_logo.png';
const Login = () => {
  const { setAuthUser } = useContext(AuthContext);

// State for login and password reset
const [loginData, setLoginData] = useState({ email: "", password: "" });
const [otp, setOtpRequest] = useState({ otp: "" });
const [emailData, setEmailData] = useState({ emailReset: "" });

// State for password reset form
const [isNewPassword, setIsNewPassword] = useState(false);
const [isLoading, setLoading] = useState(false);
const [isReset, setReset] = useState(false);
const [ErrMsg, setErrMsg] = useState(false);
const [SuccessResponse, setSuccessResponse] = useState(false);
const [handleValidationMessage, setHandleValidationMessage] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [isPasswordTyped, setIsPasswordTyped] = useState(false);
const [reqMessage, setRequestMessage] = useState("");

// State for user authentication
const [isLoggedIn, setIsLoggedIn] = useState(true);
const [isVerified, setVerified] = useState(false);

  const handleEmail = (e) => {
    setEmailData({ [e.target.name]: e.target.value });

    setOtpRequest({
      ...otp,
      [e.target.name]: e.target.value,
    });
  };
  const handleEmailVerify = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await axios.post(EmailVerifyRoute, emailData);
      if (response.status === 200) {
        setSuccessResponse(false);

        setErrMsg(false);
        setTimeout(() => {
          sessionStorage.setItem(
            "UserOTP_Token",
            JSON.stringify(response.data)
          );

          setHandleValidationMessage(response.data.message);
          setSuccessResponse(true);
          setLoading(false);
          setTimeout(() => {
            setHandleValidationMessage("Redirecting Please wait...");
            setTimeout(() => {
              setVerified(false);
              setSuccessResponse(false);
              setEmailData({ emailReset: "" });
            }, 1000);
          }, 1000);
        }, 3000);
      }
    } catch (error) {
      setErrMsg(false);
      setLoading(true);
      setSuccessResponse(false);
      setReset(false);
      setTimeout(() => {
        setErrMsg(true);
        setReset(false);
        setHandleValidationMessage("Invalid email. Please try again");
        setLoading(false);
      }, 2000);
    }
  };
  const handleOTPVerify = async (e) => {
    const user = JSON.parse(sessionStorage.getItem("UserOTP_Token"));

    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(verify_otpRoute, otp, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setSuccessResponse(false);

        setErrMsg(false);
        setTimeout(() => {
          setSuccessResponse(true);
          setHandleValidationMessage(response.data.message);
          setLoading(false);
          setTimeout(() => {
            setHandleValidationMessage("Redirecting Please wait...");
            setTimeout(() => {
              setIsNewPassword(true);
            }, 1000);
          }, 1000);
        }, 3000);
      }
    } catch (error) {
      setErrMsg(false);
      setLoading(true);
      setSuccessResponse(false);
      setReset(false);
      setTimeout(() => {
        setErrMsg(true);
        setReset(false);
        setHandleValidationMessage("Invalid OTP. Please try again");
        setLoading(false);
      }, 2000);
    }
  };

  const navigate = useNavigate();
  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "password" && e.target.value.length > 0) {
      setIsPasswordTyped(true);
    } else {
      setIsPasswordTyped(false);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setRequestMessage("")
    setLoading(true);
    try {
      const res = await axios.post(loginRoute, loginData);
      // Using localStorage
      localStorage.setItem("userData", JSON.stringify(res.data));

      setSuccessResponse(false);
      setErrMsg(false);
      if (res.status === 200) {
        const userOTPData = res.data.id;
        setAuthUser(res.data);
        setRequestMessage(null)
        setSuccessResponse(true);
        setHandleValidationMessage(res.data.message);
        setLoading(false);

        
          setTimeout(() => {
            setHandleValidationMessage("Redirecting Please wait...");
            toast.success("Logged in successfully");
            setTimeout(() => {
              navigate(`/chats/user/${userOTPData}`);
            }, 1000);
          }, 1000);
      }
    } catch (error) {
      // Other server errors
      setErrMsg(false);

      setSuccessResponse(false);
      setReset(false);
      setTimeout(() => {
        setErrMsg(true);
        setReset(true);
        setHandleValidationMessage("Invalid credentials. Please try again");
        setLoading(false);
      }, 2000);
    }
  };
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevValue) => !prevValue);
  };
  const handleResetPassword = () => {
    setReset(false);
    setErrMsg(false);
    setIsLoggedIn(false);
    setVerified(true);
  };

  return !isNewPassword ? (
    <div className="mainContainer">
      <div className="header"></div>

      <div className="registerContainer">
        <div className="container">
          {isLoggedIn ? (
            <form action="" className="form" onSubmit={handleLogin}>
            <div className="logo">
              <img src={N_logo} alt="" />
              <span className="LogoText">Nexus</span>
            </div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                autoComplete="off"
                value={loginData.email}
                onChange={handleChange}
              />
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleChange}
                />
                <span
                  className="passwordShow"
                  onClick={handleTogglePasswordVisibility}
                >
                  {isPasswordTyped &&
                    (showPassword ? <FaEyeSlash color="gray" /> : <FaEye color="gray"/>)}
                </span>
              </div>

              <button type="submit">
                {isLoading ? (
                  <div className="loader">
                    <Oval
                      visible={true}
                      height="35"
                      width="30"
                      color="#fff"
                      ariaLabel="triangle-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  </div>
                ) : ( 
                  "Login"
                )}
              </button>
              <p className="RouteLink">
                Don't have an account ? <Link to="/register" className="Link"><span>Register</span></Link>
              </p>
            </form>
          ) : (
            <>
              {isVerified ? (
                <form action="" className="form" onSubmit={handleEmailVerify}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    name="emailReset"
                    value={emailData.emailReset}
                    required
                    onChange={handleEmail}
                  />

                  <button type="submit">
                    {isLoading ? (
                      <div className="loader">
                        <Oval
                          visible={true}
                          height="35"
                          width="30"
                          color="#fff"
                          ariaLabel="triangle-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              ) : (
                <form action="" className="form" onSubmit={handleOTPVerify}>
                  <input
                    type="text"
                    placeholder="Enter your OTP"
                    name="otp"
                    value={otp.otp}
                    required
                    onChange={handleEmail}
                  />

                  <button type="submit">
                    {isLoading ? (
                      <div className="loader">
                        <Oval
                          visible={true}
                          height="35"
                          width="30"
                          color="#fff"
                          ariaLabel="triangle-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      </div>
                    ) : (
                      "Verify"
                    )}
                  </button>
                  <p className="spams">
                    Check in your Spams. Don't worry it is safe
                  </p>
                </form>
              )}
            </>
          )}

          {ErrMsg && <p className="ErrMsg">{handleValidationMessage}</p>}
          {SuccessResponse && (
            <p className="SuccessMsg">{handleValidationMessage}</p>
          )}
          {isReset && (
            <div className="reset-password" onClick={handleResetPassword}>
              <span>Reset password</span>
            </div>
          )}
        </div>
      </div>
      <p id='reqMessage'>{reqMessage}</p>
      <ToastContainer />
    </div>
  ) : (
    <ResetPassword></ResetPassword>
  );
};

export default Login;

const ResetPassword = () => {
  const [isLoading, setLoading] = useState(false);
  const [isReset, setReset] = useState(false);
  const [ErrMsg, setErrMsg] = useState(false);
  const [SuccessResponse, setSuccessResponse] = useState(false);
  const [handleValidationMessage, setHandleValidationMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTyped, setIsPasswordTyped] = useState(false);
  const [NewPasswordRequest, setNewPasswordRequest] = useState({
    NewPassword: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    setNewPasswordRequest({
      ...NewPasswordRequest,
      [e.target.name]: e.target.value,
    });
    setIsPasswordTyped(true);
  };
  const handleNewPassword = async (e) => {
    const user = JSON.parse(sessionStorage.getItem("UserOTP_Token"));
    const validation = handleValidations();
    e.preventDefault();
    if (!validation) {
      try {
        const result = await axios.patch(
          ResetPasswordRoute,
          NewPasswordRequest,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (result.status === 200) {
          setSuccessResponse(false);
          setLoading(true);
          setErrMsg(false);
          setTimeout(() => {
            setSuccessResponse(true);
            setHandleValidationMessage(result.data.message);
            setLoading(false);
            sessionStorage.removeItem("UserOTP_Token");
            setTimeout(() => {
              setHandleValidationMessage("Redirecting Please wait...");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }, 1000);
          }, 2000);
        }
      } catch (error) {
        setErrMsg(false);
        setLoading(true);
        setSuccessResponse(false);
        setReset(false);
        setTimeout(() => {
          setErrMsg(true);
          setReset(false);
          setHandleValidationMessage("Do not repeat old password. Please choose a new one");
          setLoading(false);
        }, 2000);
      }
    }
  };
  const handleValidations = (e) => {
    const { NewPassword, confirmPassword } = NewPasswordRequest;
    if (NewPassword !== confirmPassword) {
      setErrMsg(true);
      setHandleValidationMessage("Passwords do not match");
      return true;
    } else if (NewPassword.length < 8 && confirmPassword.length < 8) {
      setErrMsg(true);
      setHandleValidationMessage("Password must be at least 8 characters");
      return true;
    } else {
      setErrMsg(false);
      return false;
    }
  };
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevValue) => !prevValue);
  };
  return (
    <div className="mainContainer">
      <div className="registerContainer">
        <div className="container">
          <h1 className="LogoText">Nexus</h1>

          <form action="" className="form" onSubmit={handleNewPassword}>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                name="NewPassword"
                required
                onChange={handleChange}
              />
              <span
                className="passwordShow"
                onClick={handleTogglePasswordVisibility}
              >
                {isPasswordTyped && (showPassword ? <FaEyeSlash color="gray"/> : <FaEye color="gray"/>)}
              </span>
            </div>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                required
                onChange={handleChange}
              />
            </div>

            <button type="submit">
              {isLoading ? (
                <div className="loader">
                  <Oval
                    visible={true}
                    height="35"
                    width="30"
                    color="#fff"
                    ariaLabel="triangle-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                </div>
              ) : (
                "Set Password"
              )}
            </button>
          </form>

          {ErrMsg && <p className="ErrMsg">{handleValidationMessage}</p>}
          {SuccessResponse && (
            <p className="SuccessMsg">{handleValidationMessage}</p>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export { ResetPassword };
