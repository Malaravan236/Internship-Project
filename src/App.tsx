// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import authRoutes from "./routes/auth.routes";
// import SuspenseLayout from "./layouts/SuspenseLayout";
// import MainLayout from "./layouts/MainLayout";
// import { RefreshProvider } from "./pages/RefreshContext";
// import VerifyCertificate from "./pages/VerifyCertificate";
// import InternshipListings from "./pages/AvailableInterns";
// import NotificationsPage from "./pages/NotificationManager"; 
// import FeedbackAndCertificate from "./pages/FeedbackAndCertificate";


// import { useParams } from "react-router-dom";

// function FeedbackAndCertificateWrapper() {
//   const { applicationId } = useParams();

//   if (!applicationId) return <div>Invalid application</div>;

//   return <FeedbackAndCertificate applicationId={Number(applicationId)} />;
// }

// function App() {
//   return (
//     <RefreshProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route element={<SuspenseLayout />}>
//             <Route element={<MainLayout />}>
//               {/* Existing routes */}
//               {authRoutes.navigationRouts.map((data: any) => (
//                 <Route
//                   key={data.name}
//                   path={data.path}
//                   element={data.component}
//                 />
//               ))}

//               <Route path="/availableinterns" element={<InternshipListings />} />
//               <Route path="/verify-certificate" element={<VerifyCertificate />} />
//               <Route path="/notifications" element={<NotificationsPage />} />
//               <Route
//   path="/feedback/:applicationId"
//   element={<FeedbackAndCertificateWrapper />}
// />
//             </Route>
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </RefreshProvider>
//   );
// }

// export default App;


import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import authRoutes from "./routes/auth.routes";
import SuspenseLayout from "./layouts/SuspenseLayout";
import MainLayout from "./layouts/MainLayout";
import { RefreshProvider } from "./pages/RefreshContext";
import VerifyCertificate from "./pages/VerifyCertificate";
import InternshipListings from "./pages/AvailableInterns";
import NotificationsPage from "./pages/NotificationManager";
import FeedbackAndCertificate from "./pages/FeedbackAndCertificate";

function FeedbackAndCertificateWrapper() {
  const { applicationId } = useParams();

  if (!applicationId) return <div>Invalid application</div>;

  return <FeedbackAndCertificate applicationId={Number(applicationId)} />;
}

function App() {
  return (
    <RefreshProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SuspenseLayout />}>
            <Route element={<MainLayout />}>
              {authRoutes.navigationRouts.map((data: any) => (
                <Route key={data.name} path={data.path} element={data.component} />
              ))}

              <Route path="/availableinterns" element={<InternshipListings />} />
              <Route path="/verify-certificate" element={<VerifyCertificate />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            
              <Route
                path="/feedback/:applicationId"
                element={<FeedbackAndCertificateWrapper />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </RefreshProvider>
  );
}

export default App;