# Steve Reich Simulator: Piano Phase

## Overview

This web page allows users to simulate Steve Reich's composition *Piano Phase* both visually and auditorily. The page uses the [Web Audio API](https://www.w3.org/TR/webaudio/), the [Web Midi API](https://www.w3.org/TR/webmidi/), and some other cool modern browser features.

![screenshot](./screenshot.GIF)

## Background

*Piano Phase* is a piece of music composed by the legendary Steve Reich in 1967. It is one of Reich's first applications of his "[phasing](https://en.wikipedia.org/wiki/Phase_music)" technique, which can also be heard elsewhere in his work (notably *Come Out* and *It's Gonna Rain*).

From [Wikipedia](https://en.wikipedia.org/wiki/Piano_Phase):

> Reich's phasing works generally have two identical lines of music, which begin by playing synchronously, but slowly become out of phase with one another when one of them slightly speeds up. In Piano Phase, Reich subdivides the work (in 32 measures) into three sections, with each section taking the same basic pattern, played rapidly by both pianists.

I find Steve Reich's phasing work fascinating and mesmerizing. Listening to any of these pieces is like having an auditory hallucination of [Borges's *Library of Babel*](https://en.wikipedia.org/wiki/The_Library_of_Babel): the phasing opens up an infinite sonic space where countless combinations and permutations of sounds are realized. Melodies and rhythms form like clouds and seamlessly recombine, or else evaporate into atmosphere.

## The Simulator

### Controls

By default the simulator is programmed to use Steve Reich's 12-note sequence from *Piano Phase*, but users can change the note sequence by typing in their own notes and melodies. There are a number of different instruments that can be chosen for playback. Users can change the tempo as well as alter the phase rate of the two voices. 

### The Visualization

There are two voices that repeat the programmed sequence of notes. Each note is visualized as a colored circle which sounds as it crosses the line on the x-axis. The notes of each voice orbit the center. The auditory "phasing" can be seen in the orbits of the two sequences of circles: they orbit farther from each other as the voices are more out-of-phase, and as the voices sync back into phase, the two sequences of circles overlap.

The visualization is perhaps best understood by watching these two dancers:

<style>
    img {
        display:block;
    }
</style>

[(Click for video)![Piano Phase dance](https://img.youtube.com/vi/RTke1tQztpQ/0.jpg)](https://www.youtube.com/watch?v=RTke1tQztpQ)
