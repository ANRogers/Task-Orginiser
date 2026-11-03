import * as SunCalc from 'suncalc';

const moonPhases = [
    { name: 'New Moon', emoji: '🌑' },
    { name: 'Waxing Crescent', emoji: '🌒' },
    { name: 'First Quarter', emoji: '🌓' },
    { name: 'Waxing Gibbous', emoji: '🌔' },
    { name: 'Full Moon', emoji: '🌕' },
    { name: 'Waning Gibbous', emoji: '🌖' },
    { name: 'Last Quarter', emoji: '🌗' },
    { name: 'Waning Crescent', emoji: '🌘' }
];

export function getMoonPhase(date: Date) {
    const illumination = SunCalc.getMoonIllumination(date);

    const phaseIndex = Math.round(illumination.phase * 8) % 8;

    return {
        ...moonPhases[phaseIndex],
        illumination: Math.round(illumination.fraction * 100)
    };
}