  'use client';

  import NameForm from './components/name'; // this imports name.tsx under name/

  const NamePage = () => {
    return (
      <div className="container center">
        <h1 className="gray">Change your name</h1>
        <NameForm />
      </div>
    );
  };

  export default NamePage;
