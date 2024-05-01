import { NavLink, Outlet } from "react-router-dom";

const navigation = [
    { name: 'Home', path: '/', current: true },
    { name: 'Profile', path: '/profile', current: false},
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

export default function Root() {
  return (
    <>
      <div className="flex p-3 flex-1 bg-gray-800 text-white items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <NavLink
                  to={'/'}>
                    <img
                      className="h-8 w-auto"
                      src="./logo.svg"
                      alt="LeagueDataThingy"
                    />
                  </NavLink>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'block rounded-md px-3 py-2 text-base font-medium'
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
