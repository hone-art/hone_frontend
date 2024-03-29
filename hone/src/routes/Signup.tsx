import { FC, useState, useEffect } from "react";
import "../styles/signup.css"
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from '../utils/firebaseConfig';
import { useAuth } from "../hooks/useAuth";

const Signup: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { login, autoLogin } = useAuth();

  useEffect(() => {
    async function waitForAutoLogin() {
      await autoLogin();
    }

    waitForAutoLogin();
  }, [])

  const handleOnClick = async (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage("");

    // check if password and confirm password are same. 
    // If same, clear error message, continue, 
    // if not, return, stop further function execution.
    try {
      await checkPasswordsAreSame(password, confirmPassword);
    } catch (error) {
      setPassword('');
      setConfirmPassword('');
      setErrorMessage('Passwords do not match. Please try again.')
      return;
    }

    try {
      await checkUserNameIsNotTaken(username);
    } catch {
      setErrorMessage('username is already taken. Please choose another one')
      return;
    }

    // Create user in firebase
    // check validation of email, password
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

      // insert user into db
      const reqBody = {
        display_name: displayName,
        user_name: username,
        uuid: userCredential.user.uid,
        img_id: 1
      };


      if (displayName.length <= 0)
        reqBody.display_name = username;

      const fetchResult = await fetch(`${process.env.API_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(reqBody),
        credentials: "include"
      });

      if (fetchResult.status === 200) {
        const newUser = await fetchResult.json();
        login(newUser);
        // setUser(newUser);
        // setIsLoggedIn(true);
        // navigate(`/${newUser?.user_name}`);
      }

    } catch (error: any) {
      const errorMessage: string = error.message;
      if (errorMessage === 'Firebase: Error (auth/invalid-email).') {
        setErrorMessage('Invalid Email address');
      } else if (errorMessage === 'Firebase: Password should be at least 6 characters (auth/weak-password).') {
        setErrorMessage('Password should be at least 6 characters');
        setPassword('');
        setConfirmPassword('');
      } else if (errorMessage === 'Firebase: Error (auth/email-already-in-use).') {
        setErrorMessage('Email-already-in-use');
      }
      return;
    }

  }

  const checkPasswordsAreSame = async (password: string, confirmPassword: string) => {
    return new Promise((resolve, reject) => {
      if (password === confirmPassword) {
        resolve(true);
      } else {
        reject(new Error('Password do not match'));
      };
    });
  };

  const checkUserNameIsNotTaken = async (userName: string) => {
    return new Promise(async (resolve, reject) => {
      const reqBody = JSON.stringify({
        user_name: userName
      });
      const fetchResult = await fetch(`${process.env.API_URL}/users/username/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: reqBody
      });
      if (fetchResult.status === 400) {
        resolve(true);
      } else if (fetchResult.status === 200) {
        reject(new Error('User name is taken'));
      }
    })
  }


  return (
    <main id="signup-page">
      <section className="section-container">
        <div className="signup-container">
          <img src="/hone_black.png" alt="hone logo" className="root-hone-logo" />
          <h2 className="subtitle">sharpen those art skills.</h2>
          <form>
            <input className="signup-input email-input" type="email" placeholder="enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="input-group">
              <input className="signup-input input-half" type="text" placeholder="enter a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input className="signup-input input-half" type="text" placeholder="enter a display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="input-group">
              <input className="signup-input input-half" type="password" placeholder="enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input className="signup-input input-half" type="password" placeholder="confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <input type="submit" className="signup-button" value="create account" onClick={handleOnClick} />
          </form>
          <p className="error-message">{errorMessage}</p>
          <Link to="/" className="login-link">
            Already have an account? Login here →
          </Link>
        </div>
      </section >
    </main>
  )
};

export default Signup;