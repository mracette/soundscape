import React from 'react';
import { Link } from 'react-router-dom';

export default class NavigationPanel extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {this.props.config.map((song) => {
                    return (
                        <div key = {song.name}>
                            <Link to={`/play/${song.name}`} >{song.name}</Link>
                        </div>
                    )
                })}
            </div>
        )
    }
}