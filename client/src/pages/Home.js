import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLeft from './Components/Home/HomeLeft';
import HomeRight from './Components/Home/HomeRight';
import closeImg from '../images/close.png';

// import weather icon images
import sun from "../images/sun.png"
import sunCloudy from "../images/cloudyWithSun.png";
import cloudyNoSun from "../images/cloudyNoSun.jpg";
import sunRain from "../images/sunRain.png";
import cloudyRain from "../images/cloudyRain.png";
import thunderstorm from "../images/thunderstorm.png";
import snow from "../images/snow.png";
import mist from "../images/mist.png";
import night from "../images/night2.png";

// date fns
import { format } from 'date-fns';
import getRecommendation from './Components/Recommdation.js';

import hamburger from "../images/hamburger.png";
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';

const Home = () => {

    let navigate = useNavigate();
    const { user } = useAuthContext();
    const { logout } = useLogout();

    document.body.style.marginTop = "0%";
    document.body.style.marginRight = "0%";
    document.body.style.marginLeft = "0%";
    document.body.style.marginBottom = "0%";
    document.body.style.backgroundColor = "#ecf2f4";

    const handleLogout = () => {
        logout();
        window.location.reload();
   }

    const handleClose = () => {
        document.getElementById("displayErrorMsg").classList.add("hidden");
    }

    useEffect(() => {
        const createNotification = async () => {
            const getUser = JSON.parse(localStorage.getItem("user"));
            if(getUser) {
                const userEmail = getUser.email;
                const location = getUser.userLocation;
                const params = {param1: userEmail};

                const response = await fetch(`/api/notifications?${new URLSearchParams(params)}`);
                // const response = await fetch(`https://weather-app-server-api.herokuapp.com/api/notifications?${new URLSearchParams(params)}`);
                const json = await response.json();

                if (response.ok) {
                    let ifFound = false;
                    // loop through notifications to see if noti already exists for the current date

                    const currentD = new Date();
                    let currentDate = `${currentD.getMonth()+1}/${currentD.getDate()}/${currentD.getFullYear()}`;
                    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const getDay = days[currentD.getDay()];
                    for (let i = 0; i < json.length; i++) {
                        const current = json[i];
                        const tempDate = format(new Date(current.createdAt), 'MM/dd/yyyy');
                        if (tempDate === currentDate) {
                            ifFound = true;
                            break;
                        }
                        console.log(tempDate, getUser.date);
                    }
                    // ifFound = false;
                    if (ifFound) { // notification already exists for current day
                        console.log("notification already exists for this date, dont create a new one");
                    } else { // create a new notification for the date
                        console.log("going to create a new notification for this date");

                        // get coordinates
                        let end = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=e15a543800b7e60db9e4e04aaf22a037`;
                        const res = await fetch(end);
                        if (res.status !== 200) {
                            console.log("something went wrong with api the api");
                            return;
                        }
                        const resData = await res.json();
                        if (resData.length === 0) {
                            console.log("Error trying to get latitude and longitutde for city");
                            return;
                        }

                        // get weather data
                        let end2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${resData[0].lat}&lon=${resData[0].lon}&exclude=minutely,alerts,hourly,current&units=imperial&appid=a63f9e77a7e5b1e6d12da2311068e37d`;
                        const res2 = await fetch(end2);
                        if (res2.status === 429) {
                            console.log("Error: Weather API reached limit calls");
                            return;
                        } else if (res2.status !== 200) {
                            console.log("Error with Weather API");
                            return; 
                        }

                        const tempData = await res2.json();
                        const tempWeather = tempData.daily[0];

                        const picMap = {
                            "icon01d": sun,
                            "icon02d": sunCloudy,
                            "icon03d": cloudyNoSun,
                            "icon04d": cloudyNoSun,
                            "icon09d": cloudyRain,
                            "icon10d": sunRain,
                            "icon11d": thunderstorm,
                            "icon13d": snow,
                            "icon50d": mist,
                            "icon01n": night,
                            "icon02n": night,
                            "icon03n": cloudyNoSun,
                            "icon04n": night,
                            "icon09n": cloudyRain,
                            "icon10n": cloudyRain,
                            "icon11n": thunderstorm,
                            "icon50n": mist
                        };

                        const tempIcon = tempWeather.weather[0].icon;
                        const formatIcon = `icon${tempIcon}`;
                        const icon = picMap[formatIcon];
                        // const fit = "Hoodie";
                        const highTemp = tempWeather.temp.max.toFixed(0);
                        const lowTemp = tempWeather.temp.min.toFixed(0);
                        const fit = getRecommendation(highTemp);
                        const desc = tempWeather.weather[0].description;
                        const newNotification = {userEmail, fit, highTemp, lowTemp, desc, icon, location};
                        const response2 = await fetch('/api/notifications', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(newNotification)
                        })
                        // const response2 = await fetch('https://weather-app-server-api.herokuapp.com/api/notifications', {
                        //     method: 'POST',
                        //     headers: {'Content-Type': 'application/json'},
                        //     body: JSON.stringify(newNotification)
                        // })
                        const json2 = await response2.json();
                        if (!response2.ok) {
                            console.log(json2.error);
                            console.log(json2.emptyFields);
                        }
                        if (response2.ok) {
                            console.log("successfully created notification");
                            // create div element
                            let homeEachNoti = document.createElement("div");
                            homeEachNoti.classList.add("homeEachNoti");
        
                            let homeNotiTitle = document.createElement("p");
                            homeNotiTitle.classList.add("homeNotiTitle");
                            homeNotiTitle.innerText = `${currentDate}, ${getDay}, ${location}`;

                            let homeNotiTemps = document.createElement("div");
                            homeNotiTemps.classList.add("homeNotiTemps");

                            let firstP = document.createElement("p");
                            firstP.innerHTML = `Highest: ${highTemp}°F`;

                            let secondP = document.createElement("p");
                            secondP.innerText = `Lowest: ${lowTemp}°F`;

                            let img1 = document.createElement("img");
                            img1.classList.add("homeNotiIcon");
                            img1.src = icon;
                            img1.alt = "noti icon img";

                            homeNotiTemps.appendChild(firstP);
                            homeNotiTemps.appendChild(secondP);
                            homeNotiTemps.appendChild(img1);

                            let pDesc = document.createElement("p");
                            pDesc.style.fontSize = "medium";
                            pDesc.innerHTML = `Description: ${desc}`;

                            let pFit = document.createElement("p");
                            pFit.style.fontSize = "medium";
                            pFit.innerHTML = `Recommended fit: ${fit}`;

                            homeEachNoti.appendChild(homeNotiTitle);
                            homeEachNoti.appendChild(homeNotiTemps);
                            homeEachNoti.appendChild(pDesc);
                            homeEachNoti.appendChild(pFit);
                            document.querySelectorAll(".displayAllNotis")[0].appendChild(homeEachNoti);
                            let getChilds = document.querySelectorAll(".displayAllNotis")[0].children;

                            if (getChilds.length > 1) { // we want to have the notis display with most recent date on top
                                var nodeList = document.querySelectorAll('.displayAllNotis')[0].children;
                                nodeList = [...nodeList];
                                const getEl = nodeList.pop();
                                nodeList.unshift(getEl);
                                
                                let e = document.querySelectorAll(".displayAllNotis")[0];
                                let child = e.lastElementChild;
                                while (child) {
                                    e.removeChild(child);
                                    child = e.lastElementChild;
                                }
                                for (let i = 0; i < nodeList.length; i++) {
                                    document.querySelectorAll(".displayAllNotis")[0].appendChild(nodeList[i]);
                                }
                            }
                        }
                    }
                }
            } else {
                console.log('user not logged in, cant detect notifications');
            }
        }
        createNotification();
    });

    const handleBurgerClick = () => {
        document.querySelectorAll(".displayMenu")[0].classList.remove("hidden");
    }

    const handleCloseMenu = () => {
        document.querySelectorAll(".displayMenu")[0].classList.add("hidden");
    }

    return (
        <div id="home">
            <div className="hidden" id="displayErrorMsg">
                <div id="divForCloseBtn">
                    <div id="holdCloseImg"><img onClick={handleClose} src={closeImg} alt="Close Alerts"/></div>
                </div>
                <div id="homeErrorMsg"></div>
            </div>
            <div className="row" id="mainContainer">
                

                <div className="mobileMenu" onClick={handleBurgerClick}>
                    <img src={hamburger} alt="hamburger menu icon"/>
                </div>
                <div className="displayMenu hidden">
                    <img src={closeImg} alt="close menu" onClick={handleCloseMenu}/>
                    <h4 onClick={() => {navigate("/login");}}>Account</h4>
                    <h4><a href="#addCity" onClick={handleCloseMenu}>Weather Forecast</a></h4>
                    <h4 onClick={() => {navigate("/login");}}>Notifications</h4>
                    {user && (
                        <h4 onClick={handleLogout} >Log out</h4>
                    )}
                </div>


                <HomeLeft />
                <HomeRight />
            </div >

            <footer className="site-footer">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12 col-md-6">
                            <h6>About</h6>
                            <p className="text-justify">A weather app using location and weather apis to send notifications at a
                                preset time of what the weather is like and give out clothing recommendations as a result of the
                                weather</p>
                        </div>
                    </div>
                    <hr className="small" />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 col-sm-6 col-12">
                            <p className="copyright-text">Copyright © 2022 All Rights Reserved by WeatherApp Team
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Home;