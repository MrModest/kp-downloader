export interface ItemResponse {
    status: number;
    item:   Item;
}

export interface Item {
    id:                number;
    type:              string;
    subtype:           string;
    title:             string;
    year:              number;
    cast:              string;
    director:          string;
    genres:            Genre[];
    countries:         Country[];
    voice:             string;
    duration:          Duration;
    ac3:               number;
    langs:             number;
    quality:           number;
    plot:              string;
    tracklist:         any[];
    imdb:              number;
    imdb_rating:       number;
    imdb_votes:        number;
    kinopoisk:         number;
    kinopoisk_rating:  number;
    kinopoisk_votes:   number;
    rating:            number;
    rating_votes:      number;
    rating_percentage: number;
    views:             number;
    comments:          number;
    posters:           Posters;
    trailer:           Trailer;
    finished:          boolean;
    advert:            boolean;
    poor_quality:      boolean;
    created_at:        number;
    updated_at:        number;
    bookmarks:         any[];
    subscribed:        boolean;
    in_watchlist:      boolean;
    seasons?:          Season[]; // for TV Shows
    videos?:           Episode[]; // for movies
}

export interface Genre {
    id:    number;
    title: string;
}

export interface Country {
    id:    number;
    title: string;
}

export interface Duration {
    average: number;
    total:   number;
}

export interface Posters {
    small:  string;
    medium: string;
    big:    string;
    wide:   string;
}

export interface Season {
    id:       number;
    title:    string;
    number:   number;
    watching: SeasonWatching;
    episodes: Episode[];
}

export interface Episode {
    id:        number;
    number:    number;
    snumber:   number;
    thumbnail: string;
    title:     string;
    tracks:    number;
    duration:  number;
    ac3:       number;
    audios:    Audio[];
    subtitles: Subtitle[];
    files:     File[];
    watched:   number;
    watching:  EpisodeWatching;
}

export interface Audio {
    id:       number;
    index:    number;
    codec:    AudioCodec;
    channels: number;
    lang:     AudioLang;
    type:     AudioType | null;
    author:   Author | null;
}

export interface Author {
    id:          number;
    title:       string;
    short_title: null | string;
}

export enum AudioCodec {
    AAC = "aac",
    Ac3 = "ac3",
}

export enum AudioLang {
    Eng = "eng",
    Rus = "rus",
    Ukr = "ukr",
}

export interface AudioType {
    id:          number;
    title:       string;
    short_title: string;
}

export interface File {
    codec:      string;
    w:          number;
    h:          number;
    quality:    string;
    quality_id: number;
    file:       string;
    url:        URL;
}

export interface URL {
    http: string;
    hls:  string;
    hls4: string;
    hls2: string;
}

export interface Subtitle {
    lang:   SubtitleLang;
    shift:  number;
    embed:  boolean;
    forced: boolean;
    file:   string;
    url:    string;
}

export enum SubtitleLang {
    Eng = "eng",
    Fre = "fre",
    Rus = "rus",
}

export interface EpisodeWatching {
    status: number;
    time:   number;
}

export interface SeasonWatching {
    status: number;
}

export interface Trailer {
    id:   number;
    file: string;
    url:  string;
}

export interface DropdownItem {
    url: string;
    text: string;
    filename: string
}