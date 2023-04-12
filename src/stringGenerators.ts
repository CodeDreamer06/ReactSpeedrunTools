export default class StringGenerators {
    public static readonly indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<React.StrictMode>
	<App />
	</React.StrictMode>
);`;

    public static readonly appJs = `import './app.sass';

function App() {
	return <h1>Hello, world!</h1>
}

export default App;`;

	public static readonly buildComponent = (name: String) => `const ${name} = () => {
	return 
}

export default ${name};`;

	public static readonly colorVariablesTemplate = `$primary-color: 
$primary-text: 
$secondary-color: 
$secondary-text: 
`;

	public static readonly getFontStyling = (fontFileNames : String[], fontFamily : String) => `$${fontFamily}-fonts: "${fontFileNames.length === 1 ? fontFileNames[0] + '"' : fontFileNames.join('", "')}
@each $font-name in $${fontFamily}-fonts
	@font-face
		font-family: ${fontFamily}
		font-weight: normal
		src: url('./assets/fonts/#{$font-name}.ttf')
  ` + '\n';
}