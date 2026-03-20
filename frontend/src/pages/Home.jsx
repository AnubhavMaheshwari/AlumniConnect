const Home = () => {
    return (
        <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4 animate-fade-in">
                Home Page
            </h1>
            <p className="text-body text-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                This is the home page content.
            </p>
        </div>
    );
};

export default Home;
