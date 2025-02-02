import React, { useEffect, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import GlobalStyle from "./global-styles";
import theme from "./theme";
import { fetchUserCart } from "./ducks/cart";
import { setUserData } from "./ducks/auth";
import { fetchCategories } from "./ducks/global";
import { useDispatch, useSelector } from "react-redux";
import routes from "./views";

import {
  Header,
  PrivateRoute,
  ModalProvider,
  // Spinner,
  // NotContent,
  Notifications,
} from "./components";
import { useUpdateEffect } from "./hooks";
import { QueryClient, QueryClientProvider } from "react-query";

const Body = styled.div`
  overflow-y: auto;
  height: 100%;
  position: relative;
  width: 100%;
`;

const AppLoading = styled.div`
  height: var(--vh);
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-variant: small-caps;
  text-align: center;
  img {
    height: 60px;
    width: 60px;
  }
`;

const queryClient = new QueryClient();

function App() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const categories = useSelector((state) => state.global.categories);
  const [status, setStatus] = useState("loading");

  function updateBrowserDimensions() {
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    document.documentElement.style.setProperty("--vw", `${vw}px`);
  }
  function updateNavBar(e) {
    const page = e.currentTarget;
    if (page.scrollTop > 23) page.classList.add("hasScrolled");
    else page.classList.remove("hasScrolled");
  }

  useEffect(() => {
    setStatus("loading");
    dispatch(fetchCategories());
    dispatch(fetchUserCart());
    if (token && !user) {
      dispatch(setUserData());
    }
    // eslint-disable-next-line
  }, [token]);

  useUpdateEffect(() => {
    setStatus("done");
  }, [categories]);

  useEffect(() => {
    updateBrowserDimensions();
    window.addEventListener("resize", updateBrowserDimensions);
    return () => {
      window.removeEventListener("resize", updateBrowserDimensions);
    };
  }, []);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <ModalProvider>
            {status === "loading" ? (
              <AppLoading>
                {/* <Spinner /> */}
                <div>
                  <img src={require("./assets/logo.webp")} alt="logo" />
                  <h4>urban wear</h4>
                </div>
              </AppLoading>
            ) : (
              <Body onScroll={updateNavBar}>
                <Notifications />
                <Header />

                <Switch>
                  {routes.map(({ path, component, exact, authRequired }) =>
                    authRequired ? (
                      <PrivateRoute
                        component={component}
                        path={path}
                        exact={exact}
                        key={path.replace("/", "")}
                      />
                    ) : (
                      <Route
                        path={path}
                        exact={exact}
                        component={component}
                        key={path.replace("/", "")}
                      />
                    )
                  )}
                </Switch>
              </Body>
            )}
          </ModalProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
