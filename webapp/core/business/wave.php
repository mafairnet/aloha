<?php

/**
 * @license GNU General Public License v2 http://www.gnu.org/licenses/gpl-2.0
 * @author BlueMöhre <bluemoehre@gmx.de>
 * @copyright 2012-2016 BlueMöhre
 * @link http://www.github.com/bluemoehre
 */
class Wave
{
    const ERR_PARAM_VALUE = 1;
    const ERR_FILE_ACCESS = 2;
    const ERR_FILE_READ = 3;
    const ERR_FILE_WRITE = 4;
    const ERR_FILE_CLOSE = 5;
    const ERR_FILE_INCOMPATIBLE = 6;
    const ERR_FILE_HEADER = 7;

    const SVG_DEFAULT_RESOLUTION_FACTOR = 0.01;

    /**
     * @var string
     */
    protected $file;

    /**
     * @var string
     */
    protected $chunkId;

    /**
     * @var integer
     */
    protected $chunkSize;

    /**
     * @var string
     */
    protected $format;

    /**
     * @var string
     */
    protected $subChunk1Id;

    /**
     * @var integer
     */
    protected $subChunk1Size;

    /**
     * @var integer
     */
    protected $audioFormat;

    /**
     * @var integer
     */
    protected $channels;

    /**
     * @var integer
     */
    protected $sampleRate;

    /**
     * @var integer
     */
    protected $byteRate;

    /**
     * @var integer
     */
    protected $blockAlign;

    /**
     * @var integer
     */
    protected $bitsPerSample;

    /**
     * @var integer
     */
    protected $subChunk2Size;

    /**
     * @var integer
     */
    protected $dataOffset;

    /**
     * @var integer
     */
    protected $kiloBitPerSecond;

    /**
     * @var integer
     */
    protected $totalSamples;

    /**
     * @var float
     */
    protected $totalSeconds;


    /**
     * @param string $file
     */
    public function __construct($file = '')
    {
        if (!empty($file)) $this->setFile($file);
    }

    /**
     * @param string $file
     * @throws Exception
     */
    public function setFile($file)
    {
        if (empty($file)) throw new UnexpectedValueException('No file specified', self::ERR_PARAM_VALUE);
        $fileHandle = fopen($file, 'r');
        if ($fileHandle === FALSE) throw new RuntimeException('Failed to open file for reading<', self::ERR_FILE_ACCESS);
        $this->file = $file;

        $chunkId = fread($fileHandle, 4);
        if ($chunkId === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        if ($chunkId !== 'RIFF') throw new Exception('Unsupported file type', self::ERR_FILE_INCOMPATIBLE);
        $this->chunkId = $chunkId;

        $chunkSize = fread($fileHandle, 4);
        if ($chunkSize === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        $this->chunkSize = unpack('VchunkSize', $chunkSize);

        $format = fread($fileHandle, 4);
        if ($format === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        if ($format !== 'WAVE') throw new Exception('Unsupported file format', self::ERR_FILE_INCOMPATIBLE);
        $this->format = $format;

        $subChunk1Id = fread($fileHandle, 4);
        if ($subChunk1Id === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        if ($subChunk1Id !== 'fmt ') throw new Exception('Unsupported file format', self::ERR_FILE_INCOMPATIBLE);
        $this->subChunk1Id = $subChunk1Id;

        $offset = ftell($fileHandle);
        $subChunk1 = fread($fileHandle, 20);
        if ($subChunk1 === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        $subChunk1 = unpack('VsubChunk1Size/vaudioFormat/vchannels/VsampleRate/VbyteRate/vblockAlign/vbitsPerSample', $subChunk1);
        $this->subChunk1Size = $subChunk1['subChunk1Size'];
        $offset = $offset + 4;
        if ($subChunk1['audioFormat'] != 1) throw new Exception('Unsupported audio format', self::ERR_FILE_INCOMPATIBLE);
        $this->audioFormat = $subChunk1['audioFormat'];
        $this->channels = $subChunk1['channels'];
        $this->sampleRate = $subChunk1['sampleRate'];
        $this->byteRate = $subChunk1['byteRate'];
        $this->blockAlign = $subChunk1['blockAlign'];
        $this->bitsPerSample = $subChunk1['bitsPerSample'];
        if ($this->byteRate != $this->sampleRate * $this->channels * $this->bitsPerSample / 8) throw new Exception('File header contains invalid data', self::ERR_FILE_HEADER);
        if ($this->blockAlign != $this->channels * $this->bitsPerSample / 8) throw new Exception('File header contains invalid data', self::ERR_FILE_HEADER);

        if (fseek($fileHandle, $offset + $this->subChunk1Size) == -1) throw new RuntimeException('Failed to seek in file', self::ERR_FILE_READ);
        $subChunk2Id = fread($fileHandle, 4);
        if ($subChunk2Id === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        if ($subChunk2Id !== 'data') throw new Exception('File header contains invalid data', self::ERR_FILE_HEADER);

        $subChunk2 = fread($fileHandle, 4);
        if ($subChunk2 === FALSE) throw new RuntimeException('Failed to read from file', self::ERR_FILE_READ);
        $subChunk2 = unpack('VdataSize', $subChunk2);
        $this->subChunk2Size = $subChunk2['dataSize'];
        $this->dataOffset = ftell($fileHandle);

        $this->kiloBitPerSecond = $this->byteRate * 8 / 1000;
        $this->totalSamples = $this->subChunk2Size * 8 / $this->bitsPerSample / $this->channels;
        $this->totalSeconds = $this->subChunk2Size / $this->byteRate;

        if (!fclose($fileHandle)) throw new RuntimeException('Failed to close file', self::ERR_FILE_CLOSE);
    }

    /**
     * TODO verify calculations
     * @param string $outputFile
     * @param float $resolution - Must be <=1. If 1 SVG will be full waveform resolution (amazing large filesize)
     * @return string
     * @throws Exception
     */
    public function generateSvg($outputFile = '', $resolution = self::SVG_DEFAULT_RESOLUTION_FACTOR)
    {
        $outputFileHandle = null;

        if (!empty($outputFile)) {
            $outputFileHandle = fopen($outputFile, 'w');
            if (!$outputFileHandle) throw new RuntimeException('Failed to open output file for writing', self::ERR_FILE_ACCESS);
        }
        if (filter_var($resolution, FILTER_VALIDATE_FLOAT) === FALSE) throw new InvalidArgumentException('Resolution must be of type float', self::ERR_PARAM_VALUE);
        if ($resolution > 1.0 || $resolution < 0.000001) throw new OutOfRangeException('Resolution must be between 1 and 0.000001', self::ERR_PARAM_VALUE);

        if (empty($this->file)) throw new Exception('No file was loaded', self::ERR_FILE_ACCESS);
        $fileHandle = fopen($this->file, 'r');
        if (!$fileHandle) throw new RuntimeException('Failed to open file', self::ERR_FILE_ACCESS);

        $sampleSummaryLength = $this->sampleRate / ($resolution * $this->sampleRate);
        $sampleSummaries = array();
        $i = 0;
        if (fseek($fileHandle, $this->dataOffset) == -1) throw new RuntimeException('Failed to seek in file', self::ERR_FILE_READ);

        while (($data = fread($fileHandle, $this->bitsPerSample))) {
            $sample = unpack('svol', $data);
            $samples[] = $sample['vol'];

            // when all samples for a summary are collected, get lows & peaks
            if ($i > 0 && $i % $sampleSummaryLength == 0) {
                $minValue = min($samples);
                $maxValue = max($samples);
                $sampleSummaries[] = array($minValue, $maxValue);
                $samples = array(); // reset
            }
            $i++;

            // TODO analyze side effects and remove
            // skip to increase speed
            if (fseek($fileHandle, $this->bitsPerSample * $this->channels * 3, SEEK_CUR) == -1) throw new RuntimeException('Failed to seek in file', self::ERR_FILE_READ);
        }

        if (!fclose($fileHandle)) throw new RuntimeException('Failed to close file', self::ERR_FILE_CLOSE);

        $minPossibleValue = pow(2, $this->bitsPerSample) / 2 * -1;
        $maxPossibleValue = $minPossibleValue * -1 - 1;
        $range = pow(2, $this->bitsPerSample);
        $svgPathTop = '';
        $svgPathBottom = '';

        foreach ($sampleSummaries as $x => $sampleMinMax) {
            # TODO configurable vertical detail
            $y = round(100 / $range * ($maxPossibleValue - $sampleMinMax[1]));
            $svgPathTop .= "L$x $y";
            # TODO configurable vertical detail
            $y = round(100 / $range * ($maxPossibleValue + $sampleMinMax[0] * -1));
            $svgPathBottom = "L$x $y" . $svgPathBottom;
        }

        // TODO move gradient to stylesheet
        // TODO this should be improved to use kinda template
        $svg =
            //'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="' . count($sampleSummaries) . 'px" height="100px" preserveAspectRatio="none">' .
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100px" preserveAspectRatio="xMaxYMax meet">' .
            '<defs>' .
            '<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">' .
            '<stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:1"/>' .
            '<stop offset="50%" style="stop-color:rgb(50,50,50);stop-opacity:1"/>' .
            '<stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1"/>' .
            '</linearGradient>' .
            '</defs>' .
            '<path d="M0 50' . $svgPathTop . $svgPathBottom . 'L0 50 Z" fill="url(#gradient)"/>' .
            '</svg>';

        /*if ($outputFileHandle) {
            if (fwrite($outputFileHandle, $svg) === FALSE) throw new RuntimeException('Failed to write to output file', self::ERR_FILE_WRITE);
            if (!fclose($outputFileHandle)) throw new RuntimeException('Failed to close output file', self::ERR_FILE_CLOSE);
        }*/

        return $svg;
    }

    /**
     * @return integer
     */
    public function getChannels()
    {
        return $this->channels;
    }

    /**
     * @return integer
     */
    public function getSampleRate()
    {
        return $this->sampleRate;
    }

    /**
     * @return integer
     */
    public function getByteRate()
    {
        return $this->byteRate;
    }

    /**
     * @return integer
     */
    public function getKiloBitPerSecond()
    {
        return $this->kiloBitPerSecond;
    }

    /**
     * @return integer
     */
    public function getBitsPerSample()
    {
        return $this->bitsPerSample;
    }

    /**
     * @return integer
     */
    public function getTotalSamples()
    {
        return $this->totalSamples;
    }

    /**
     * @param bool $float
     * @return float|int
     */
    public function getTotalSeconds($float = false)
    {
        return $float ? $this->totalSeconds : round($this->totalSeconds);
    }

}
