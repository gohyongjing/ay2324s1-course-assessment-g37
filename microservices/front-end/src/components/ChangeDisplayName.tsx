import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ChangeDisplayName.module.css";
import { User } from "./types";
import { UserProvider, useUserContext } from "../UserContext";

// Similarly, should only allow change of display name if passes authentication
const ChangeDisplayName: React.FC = () => {
  const { currentUser, setCurrentUser } = useUserContext();
  const [displayName, setDisplayName] = useState<string>("");
  const navigate = useNavigate();

  // check if currentUser is authenticated, if not, direct back to login
  useEffect(() => {
    if (Object.keys(currentUser).length != 0 && !currentUser.username) {
      navigate("/login");
    }
  });

  // on windows reload, need to re-fetch user credential
  useEffect(() => {
    if (Object.keys(currentUser).length === 0) {
      // initially currentUser = {}
      axios
        .get("/api/auth/current-user")
        .then((response) => {
          console.log(response.data);
          const userData: User = response.data;
          setCurrentUser(userData);
          console.log(currentUser.username);
        })
        .catch((error) => {
          console.error("Error fetching current user", error);
        });
    }
  }, [currentUser, setCurrentUser]);

  const handleChangeDisplayName = async () => {
    const alphanumeric = /^[a-z0-9]+$/i;
    if (!displayName) {
      alert("New display name cannot be empty");
      return;
    }

    if (!alphanumeric.test(displayName)) {
      alert("Display Name must be alphanumeric.");
      return;
    }

    try {
      const updatedUser = {
        ...currentUser,
        displayName,
      };
      const response = await axios.put(
        `/api/users/${updatedUser.username}`,
        updatedUser
      );
      if (response.status === 200) {
        setCurrentUser(updatedUser);
        alert("Display name changed successfully");
        setDisplayName("");
        navigate("/profile");
      }
    } catch (error: unknown) {
      // display name can just allow update
      alert("Changing of display name failed");
      console.error("An unknown error occurred:", error);
    }
  };

  const handleCancel = () => {
    setDisplayName("");
    navigate("/profile");
  };

  return (
    <div>
      <div className={styles.change_display_name_container}>
        <h1>Change Display Name</h1>
        <div className={styles.input_field}>
          <label className={styles.the_label} htmlFor="displayName">
            New Display Name
          </label>
          <input
            className={styles.input_text}
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <button
          className={styles.action_button}
          onClick={handleChangeDisplayName}
        >
          Save
        </button>
        <button className={styles.action_button} onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
export default ChangeDisplayName;
