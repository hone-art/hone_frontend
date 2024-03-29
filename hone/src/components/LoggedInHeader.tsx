import { useRef, FC, useEffect, useState } from "react";
import "../styles/header.css";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from "../hooks/useAuth";

const LoggedInHeader: FC = () => {
  const [profilePhotoURL, setProfilePhotoURL] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    async function fetchPhoto() {
      const fetchPhoto = await fetch(`${process.env.API_URL}/images/${user?.img_id}`);
      const photo = await fetchPhoto.json();

      setProfilePhotoURL(photo.url);
    }

    fetchPhoto();
  }, [user])

  async function handleLogoutOnClick() {
    logout();
    return;
  }

  return (
    <header className="header">
      <Link to={`/${user?.user_name}`} className="hone-button">
        <img src="/hone_white.png" alt="hone image" />
      </Link>
      <SearchBar></SearchBar>
      <button onClick={onOpen} className="menu-button"><span className="material-icons">menu</span></button>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton className="drawer-close-btn" />
          <DrawerHeader>
            <div className="drawer-header-container">
              <img className="profile-photo" src={profilePhotoURL} alt="profile picture" />
              <div className="drawer-names">
                <h1>{user?.display_name}</h1>
                <p className="menu-display-name">@{user?.user_name}</p>
              </div>
            </div>
            <hr />
          </DrawerHeader>

          <DrawerBody>
            <div className="drawer-link-container">
              <span className="material-symbols-outlined">
                account_circle
              </span>
              <Link className="link" to={`/${user?.user_name}`}>Your profile</Link>
            </div>
            <div className="drawer-link-container">
              <span className="material-symbols-outlined">
                calendar_month
              </span>
              <Link className="link" to={`/${user?.user_name}/calendar`}>Your calendar</Link>
            </div>
            <div className="drawer-link-container">
              <span className="material-symbols-outlined">
                hotel_class
              </span>
              <Link className="link" to={"/inspiration"}>Inspiration</Link>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <p className="link" onClick={handleLogoutOnClick}> Logout →</p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </header >

  )
}

export default LoggedInHeader;