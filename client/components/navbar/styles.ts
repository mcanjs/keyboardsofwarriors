import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';

export const Navbar = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  margin-top: 30px;
`;

export const NavbarLeftWrapper = styled.div`
  display: flex;
`;

export const NavbarLogo = styled.div`
  min-width: 232px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: 700;
  font-style: normal;
`;

export const NavbarLanguageChanger = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const NavbarLanguageFlag = styled.div`
  width: 32px;
  height: 32px;
  position: relative;
  img {
    border-radius: 50%;
    object-fit: cover;
    object-position: left;
    filter: drop-shadow(0px 11px 23px rgba(0, 0, 0, 0.25));
  }
`;

export const NavbarLanguageChangerIcon = styled(FaChevronDown)`
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
`;

export const NavbarRightWrapper = styled.div`
  display: flex;
`;

export const NavbarMenuList = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
`;
export const NavbarListItem = styled.li`
  padding-right: 69px;
`;

export const NavbarListLink = styled(Link)`
  font-weight: 400;
  font-size: 16px;
  text-decoration: none;
  color: #000000;
`;
