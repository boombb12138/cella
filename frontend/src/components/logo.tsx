import { config } from 'config';
import { useThemeStore } from '~/store/theme';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  iconColor?: string;
  textColor?: string;
  height?: number;
}

function Logo({ className, iconColor, textColor, height = 50, ...props }: LogoProps) {
  const { mode, theme } = useThemeStore();
  const defaultTextColor = mode === 'light' ? '#333' : '#fff';
  const defaultIconColor = theme === 'none' ? '#333' : config.theme.rose.primary;
  if (!textColor) textColor = defaultTextColor;
  if (!iconColor) iconColor = defaultIconColor;

  return (
    <>
      <svg id="svg-logo" xmlns="http://www.w3.org/2000/svg" {...props} className={className} width="100%" height={height} viewBox="0 0 1800 500">
        <title>Logo</title>
        <g id="svg-logo-icon" fill="none" fillRule="evenodd" style={{ transformBox: 'fill-box' }} transform="rotate(0)">
          <path
            fill={iconColor}
            d="M335 15a150 150 0 0 1 150 150v170a150 150 0 0 1-150 150H165A150 150 0 0 1 15 335V165A150 150 0 0 1 165 15h170Zm-50 150h-70a50 50 0 0 0-50 50v70a50 50 0 0 0 50 50h70a50 50 0 0 0 50-50v-70a50 50 0 0 0-50-50Z"
          />
          <path
            fill="#FFF"
            fillOpacity=".4"
            d="M315 65a120 120 0 0 1 120 120v130a120 120 0 0 1-120 120H185A120 120 0 0 1 65 315V185A120 120 0 0 1 185 65h130Zm-30 100h-70a50 50 0 0 0-50 50v70a50 50 0 0 0 50 50h70a50 50 0 0 0 50-50v-70a50 50 0 0 0-50-50Z"
          />
          <path
            fill="#FFF"
            fillOpacity=".5"
            d="M295 115a90 90 0 0 1 90 90v90a90 90 0 0 1-90 90h-90a90 90 0 0 1-90-90v-90a90 90 0 0 1 90-90h90Zm-10 50h-70a50 50 0 0 0-50 50v70a50 50 0 0 0 50 50h70a50 50 0 0 0 50-50v-70a50 50 0 0 0-50-50Z"
          />
        </g>

        <g id="svg-logo-text" fill={textColor} transform="translate(600,0)" fillRule="nonzero">
          <path d="M177.107 388c-20.694 0-39.806-4.548-57.338-13.645-17.532-9.097-31.543-22.174-42.033-39.23C67.246 318.068 62 298.026 62 275c0-23.026 5.245-43.068 15.736-60.125 10.49-17.056 24.501-30.133 42.033-39.23C137.3 166.548 156.413 162 177.107 162c15.232 0 28.381 1.919 39.446 5.757 11.066 3.837 21.34 8.741 30.825 14.71 5.748 3.697 8.622 8.671 8.622 14.925 0 4.265-1.653 8.173-4.958 11.727-3.305 3.553-7.113 5.33-11.424 5.33-3.162 0-6.323-.853-9.485-2.558-9.484-4.833-17.603-8.316-24.357-10.448-6.755-2.132-15.161-3.198-25.22-3.198-24.717 0-44.117 7.036-58.2 21.108-14.083 14.072-21.125 32.62-21.125 55.647 0 23.026 7.042 41.575 21.125 55.647 14.083 14.072 33.483 21.108 58.2 21.108 10.059 0 18.465-1.066 25.22-3.198 6.754-2.132 14.873-5.615 24.357-10.448 3.162-1.705 6.323-2.558 9.485-2.558 4.31 0 8.119 1.777 11.424 5.33 3.305 3.554 4.958 7.462 4.958 11.727 0 6.254-2.874 11.228-8.622 14.924-9.485 5.97-19.76 10.874-30.825 14.711-11.065 3.838-24.214 5.757-39.446 5.757ZM447.224 388c-34.613 0-61.637-9.879-81.072-29.636C346.717 338.607 337 310.82 337 275c0-20.184 3.688-38.804 11.065-55.86 7.377-17.057 18.725-30.844 34.046-41.363C397.431 167.26 416.3 162 438.713 162c20.995 0 39.153 4.904 54.474 14.711 15.32 9.808 26.953 22.885 34.897 39.23C536.028 232.288 540 250.127 540 269.458c0 5.4-1.773 9.95-5.32 13.645-3.546 3.695-8.298 5.543-14.257 5.543h-144.27c2.27 19.9 9.646 35.393 22.13 46.48 12.484 11.086 29.932 16.63 52.346 16.63 11.916 0 22.343-1.137 31.28-3.412 8.937-2.274 17.661-5.543 26.173-9.807 2.27-1.137 4.823-1.706 7.66-1.706 4.54 0 8.512 1.564 11.916 4.69 3.405 3.128 5.107 7.108 5.107 11.94 0 6.254-3.688 11.514-11.065 15.778-11.065 6.254-21.988 10.944-32.77 14.071-10.78 3.127-24.683 4.691-41.706 4.691Zm54.474-130.91c-.851-13.929-4.468-25.584-10.852-34.965-6.384-9.382-14.257-16.275-23.62-20.682-9.362-4.406-18.867-6.609-28.513-6.609-9.647 0-19.151 2.203-28.514 6.61-9.363 4.406-17.165 11.3-23.407 20.68-6.241 9.382-9.788 21.037-10.639 34.967h125.545ZM656.78 386c-5.568 0-10.256-1.862-14.066-5.586-3.81-3.725-5.714-8.309-5.714-13.752V87.768c0-5.444 1.905-10.1 5.714-13.967 3.81-3.867 8.498-5.801 14.066-5.801 5.861 0 10.696 1.862 14.506 5.586 3.81 3.725 5.714 8.452 5.714 14.182v278.894c0 5.443-1.978 10.027-5.934 13.752-3.956 3.724-8.718 5.586-14.286 5.586ZM809.78 386c-5.568 0-10.256-1.862-14.066-5.586-3.81-3.725-5.714-8.309-5.714-13.752V87.768c0-5.444 1.905-10.1 5.714-13.967 3.81-3.867 8.498-5.801 14.066-5.801 5.861 0 10.696 1.862 14.506 5.586 3.81 3.725 5.714 8.452 5.714 14.182v278.894c0 5.443-1.978 10.027-5.934 13.752-3.956 3.724-8.718 5.586-14.286 5.586ZM997.437 388c-12.676 0-24.416-2.558-35.219-7.675s-19.373-12.58-25.711-22.387c-6.338-9.808-9.507-21.108-9.507-33.9 0-21.037 8.426-37.81 25.28-50.317 16.852-12.508 41.556-18.763 74.11-18.763h52.286v-3.41c0-18.763-4.68-32.266-14.044-40.51-9.362-8.244-23.983-12.366-43.86-12.366-10.948 0-20.67.853-29.17 2.558-8.498 1.706-17.932 4.264-28.303 7.676-2.305.568-4.178.852-5.618.852-4.321 0-8.066-1.563-11.235-4.69-3.17-3.127-4.754-6.965-4.754-11.513 0-7.676 3.745-13.077 11.236-16.204 24.487-10.234 49.406-15.351 74.758-15.351 19.877 0 36.658 3.98 50.342 11.94 13.684 7.96 23.767 18.264 30.25 30.915 6.481 12.65 9.722 26.366 9.722 41.149v120.675c0 5.402-1.945 9.95-5.834 13.646-3.889 3.695-8.57 5.543-14.044 5.543-5.473 0-10.083-1.848-13.828-5.543-3.745-3.696-5.618-8.244-5.618-13.646v-11.087c-21.318 21.605-48.398 32.408-81.24 32.408Zm14.692-34.113c12.676 0 24.92-3.056 36.73-9.168 11.812-6.112 21.751-13.716 29.817-22.813v-35.82h-47.101c-43.501 0-65.251 11.23-65.251 33.688 0 10.234 3.529 18.478 10.587 24.732 7.058 6.254 18.797 9.38 35.218 9.38Z" />
        </g>
      </svg>
    </>
  );
}

export default Logo;
