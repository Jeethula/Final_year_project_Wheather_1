import React, { useState } from 'react';
import { Box, Container, Grid, SvgIcon, Typography } from '@mui/material';
import Search from './components/Search/Search';
import WeeklyForecast from './components/WeeklyForecast/WeeklyForecast';
import TodayWeather from './components/TodayWeather/TodayWeather';
import { fetchWeatherData } from './api/OpenWeatherService';
import { transformDateFormat } from './utilities/DatetimeUtils';
import UTCDatetime from './components/Reusable/UTCDatetime';
import LoadingBox from './components/Reusable/LoadingBox';
import { ReactComponent as SplashIcon } from './assets/splash-icon.svg';
import Logo from './assets/logo.png';
import ErrorBox from './components/Reusable/ErrorBox';
import { ALL_DESCRIPTIONS } from './utilities/DateConstants';
// import GitHubIcon from '@mui/icons-material/GitHub';
import FloodIcon from '@mui/icons-material/WaterDamage';
import LandslideIcon from '@mui/icons-material/Landscape';
import {
  getTodayForecastWeather,
  getWeekForecastWeather,
} from './utilities/DataUtils';


function App() {
  const [todayWeather, setTodayWeather] = useState(null);
  const [todayForecast, setTodayForecast] = useState([]);
  const [weekForecast, setWeekForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [floodRisk, setFloodRisk] = useState("Low");
  const [landslideRisk, setLandslideRisk] = useState("Low");

  const searchChangeHandler = async (enteredData) => {
    const [latitude, longitude] = enteredData.value.split(' ');
    const cityName = enteredData.label;

    setIsLoading(true);

    const currentDate = transformDateFormat();
    const date = new Date();
    let dt_now = Math.floor(date.getTime() / 1000);

    try {
      const [todayWeatherResponse, weekForecastResponse] =
        await fetchWeatherData(latitude, longitude);
      const all_today_forecasts_list = getTodayForecastWeather(
        weekForecastResponse,
        currentDate,
        dt_now
      );

      const all_week_forecasts_list = getWeekForecastWeather(
        weekForecastResponse,
        ALL_DESCRIPTIONS
      );

      setTodayForecast([...all_today_forecasts_list]);
      setTodayWeather({ city: enteredData.label, ...todayWeatherResponse });
      setWeekForecast({
        city: enteredData.label,
        list: all_week_forecasts_list,
      });

      const risks = getRisksByLocation(cityName);
      console.log(risks);
      setFloodRisk(risks.floodRisk);
      setLandslideRisk(risks.landslideRisk);
    } catch (error) {
      setError(true);
    }

    setIsLoading(false);
  };

  const getRiskColor = (risk) => {
    switch(risk.toLowerCase()) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffbb33';
      case 'low': return '#00C851';
      default: return '#ffffff';
    }
  };

  let appContent = (
    <Box
      xs={12}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: '100%',
        minHeight: '500px',
      }}
    >
      <SvgIcon
        component={SplashIcon}
        inheritViewBox
        sx={{ fontSize: { xs: '100px', sm: '120px', md: '140px' } }}
      />
      <Typography
        variant="h4"
        component="h4"
        sx={{
          fontSize: { xs: '12px', sm: '14px' },
          color: 'rgba(255,255,255, .85)',
          fontFamily: 'Poppins',
          textAlign: 'center',
          margin: '2rem 0',
          maxWidth: '80%',
          lineHeight: '22px',
        }}
      >
        Explore current weather data and 6-day forecast of more than 200,000
        cities!
      </Typography>
    </Box>
  );

  if (todayWeather && todayForecast && weekForecast) {
    appContent = (
      <React.Fragment>
      <Grid item xs={12} md={todayWeather ? 6 : 12}>
        <Grid item xs={12}>
        <TodayWeather data={todayWeather} forecastList={todayForecast} />
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <WeeklyForecast data={weekForecast} />
      </Grid>
      <Grid item xs={12} md={6} sx={{ mt: 2 }}>
        <Box 
        display="flex" 
        alignItems="center"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '1rem',
          borderRadius: '10px'
        }}
        >
        <FloodIcon sx={{ 
          fontSize: 40, 
          marginRight: 2, 
          color: getRiskColor(floodRisk) 
        }} />
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, .85)' }}>
          Flood Forecast: {floodRisk} Risk
        </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} sx={{ mt: 2 }}>
        <Box 
        display="flex" 
        alignItems="center"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '1rem',
          borderRadius: '10px'
        }}
        >
        <LandslideIcon sx={{ 
          fontSize: 40, 
          marginRight: 2, 
          color: getRiskColor(landslideRisk) 
        }} />
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, .85)' }}>
          Landslide Forecast: {landslideRisk} Risk
        </Typography>
        </Box>
      </Grid>
      </React.Fragment>
    );
  }

  if (error) {
    appContent = (
      <ErrorBox
        margin="3rem auto"
        flex="inherit"
        errorMessage="Something went wrong"
      />
    );
  }

  if (isLoading) {
    appContent = (
      <Box
        sx={{
          display: 'flex',
          justifyContent:"center",
          alignItems:"center",
          width: '100%',
          minHeight: '500px',
        }}
      >
        <LoadingBox value="1">
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontSize: { xs: '10px', sm: '12px' },
              color: 'rgba(255, 255, 255, .8)',
              lineHeight: 1,
              fontFamily: 'Poppins',
            }}
          >
            Loading...
          </Typography>
        </LoadingBox>
      </Box>
    );
  }

  return (
    <Container
      sx={{
        maxWidth: { xs: '95%', sm: '80%', md: '1100px' },
        width: '100%',
        height: '100%',
        margin: '0 auto',
        padding: '1rem 0 3rem',
        marginBottom: '1rem',
        borderRadius: {
          xs: 'none',
          sm: '0 0 1rem 1rem',
        },
        boxShadow: {
          xs: 'none',
          sm: 'rgba(0,0,0, 0.5) 0px 10px 15px -3px, rgba(0,0,0, 0.5) 0px 4px 6px -2px',
        },
      }}
    >
      <Grid container columnSpacing={2}>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              width: '100%',
              marginBottom: '1rem',
            }}
          >
            <Box
              component="img"
              sx={{
                height: { xs: '16px', sm: '22px', md: '26px' },
                width: 'auto',
              }}
              alt="logo"
              src={Logo}
            />

            <UTCDatetime />
            {/* <Link
              href="https://github.com/Amin-Awinti"
              target="_blank"
              underline="none"
              sx={{ display: 'flex' }}
            > */}
              {/* <GitHubIcon
                sx={{
                  fontSize: { xs: '20px', sm: '22px', md: '26px' },
                  color: 'white',
                  '&:hover': { color: '#2d95bd' },
                }}
              />
            </Link> */}
          </Box>
          <Search onSearchChange={searchChangeHandler} />
        </Grid>
        {appContent}
      </Grid>
    </Container>
  );
}

export default App;


export const locationRisks = [
  {
    city: "Coimbatore, IN",
    floodRisk: "Low",
    landslideRisk: "Low",
    coordinates: "11.0168 76.9558"
  },
  {
    city: "Chennai, IN",
    floodRisk: "High", 
    landslideRisk: "Low",
    coordinates: "13.0827 80.2707"
  },
  {
    city: "Bangalore, IN",
    floodRisk: "Medium",
    landslideRisk: "Low",
    coordinates: "12.9716 77.5946"
  },
  {
    city: "Hyderabad, IN",
    floodRisk: "Medium",
    landslideRisk: "Low",
    coordinates: "17.3850 78.4867"
  },
  {
    city: "Mumbai, IN",
    floodRisk: "High",
    landslideRisk: "Low",
    coordinates: "19.0760 72.8777"
  },
  {
    city: "Delhi, IN",
    floodRisk: "Medium",
    landslideRisk: "Low",
    coordinates: "28.7041 77.1025"
  },
  {
    city: "Kolkata, IN",
    floodRisk: "High",
    landslideRisk: "Low",
    coordinates: "22.5726 88.3639"
  },
  {
    city: "Jaipur, IN",
    floodRisk: "Low",
    landslideRisk: "Low",
    coordinates: "26.9124 75.7873"
  },
  {
    city: "Ooty, IN",
    floodRisk: "Medium",
    landslideRisk: "High",
    coordinates: "26.8467 80.9462"
  },
  {
    city: "Shimla, IN",
    floodRisk: "Low",
    landslideRisk: "High",
    coordinates: "31.1048 77.1734"
  },
  // Add more cities as needed
];

export const getRisksByLocation = (searchedCity) => {
  console.log(searchedCity);
  const cityData = locationRisks.find(
    location => location.city.toLowerCase() === searchedCity.toLowerCase()
  );
  return cityData || { floodRisk: "Low", landslideRisk: "Low" };
};
