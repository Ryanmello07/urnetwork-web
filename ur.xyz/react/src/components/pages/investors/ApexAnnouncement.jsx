import React from 'react';
import { investorCentre } from '../../../data/investors';
import './InvestorAnnouncement.css';

/**
 * The Apex (SN1) competition announcement (/investors/apex-competition): a
 * summary header over the announcement itself, reproduced as a white sheet in
 * the conviction announcement's dress. Static; the Astro page server-renders
 * it without hydration. Two sheets, split where the PDF turns the page, so the
 * screen reads like the document; print starts each sheet on a new page.
 *
 * Named explicitly rather than read from `featured`: this is the Apex
 * announcement whatever the Investor Centre leads with next.
 */
const announcement = investorCentre.apexAnnouncement;

export default function ApexAnnouncement() {
    return (
        <div className="announcement-page" id="announcement">
            <div className="announcement-toolbar announcement-shell">
                <a className="announcement-back" href="/investors">
                    <span aria-hidden="true">←</span> Investor Centre
                </a>
                <div className="announcement-actions">
                    <a className="announcement-download" href={announcement.pdfHref} download>
                        Download PDF <span aria-hidden="true">↓</span>
                    </a>
                </div>
            </div>

            <header className="announcement-summary announcement-shell">
                <p className="announcement-kicker">
                    <span aria-hidden="true"></span>
                    {announcement.category}
                </p>
                <h1>{announcement.headline}</h1>
                <div className="announcement-summary-meta">
                    <div className="announcement-issuer">
                        <span className="announcement-issuer__mark" aria-hidden="true">
                            <img src="/favicon.svg" alt="" />
                        </span>
                        <span>
                            <strong>UR Foundation</strong>
                            <small>UR (SN25)</small>
                        </span>
                    </div>
                    <p>
                        <span>Dated <time dateTime={announcement.dateIso}>{announcement.date}</time></span>
                        <span>{announcement.readTime}</span>
                    </p>
                </div>
            </header>

            <div className="announcement-stage">
                <article className="announcement-paper announcement-paper--tokenholders" aria-labelledby="apex-title">
                    <header className="announcement-letterhead">
                        <img className="announcement-wordmark" src="/ur.svg" alt="UR" />
                        <address className="announcement-address">
                            <strong>UR FOUNDATION</strong>
                            Bittensor Subnet 25 (netuid 25)<br />
                            Protocol: github.com/urfoundation/sn<br />
                            Network: ur.xyz<br />
                            Applications: ur.io
                        </address>
                    </header>

                    <p className="announcement-date"><time dateTime={announcement.dateIso}>{announcement.date}</time></p>

                    <h2 className="announcement-document-title" id="apex-title">
                        UR (SN25) launches open competition on Apex (SN1) to optimise the routing and provider-matching algorithms behind its privacy network
                    </h2>

                    <section className="announcement-document-section" aria-labelledby="apex-highlights">
                        <h3 id="apex-highlights">Highlights</h3>
                        <ul>
                            <li>UR (SN25) has commissioned an open competition on Apex (SN1), operated by Macrocosmos, to improve the routing and provider-matching algorithms that determine the speed, reliability and reachability of the UR network.</li>
                            <li>The competition targets four named problems in the published protocol: hop selection under URTRANSPORT1, the provider window managed by UR-MULTI, re-enablement of the multi-provider hop and the peer-to-peer stream upgrade, and matching metadata in UR-FP2 that preserves its Sybil-resistance property.</li>
                            <li>All current algorithms are already published as open source, and UR will release anonymised per-block datasets covering matching inputs and selected outputs so that submissions can be evaluated against real network conditions rather than simulation.</li>
                            <li>Improvements adopted into production benefit the 100,000+ miners carrying traffic on the network and the network operators purchasing capacity from it.</li>
                            <li>This is the first competition to place the routing layer of a live production network in front of the Bittensor research community.</li>
                        </ul>
                    </section>

                    <p>UR Foundation (UR (SN25) or the Network) today announces an open competition, hosted on Apex (SN1) and operated by Macrocosmos, to improve the algorithms that route traffic across the UR network. The competition opens the Network’s core optimisation problem to the Bittensor research community, with the objective of raising measured throughput and reliability for the miners who supply capacity and the network operators who purchase it.</p>

                    <p>UR (SN25) is a decentralised-native, multi-IP, multi-transport protocol rather than a conventional site-to-site tunnel. More than 100,000 miners across over 100 countries keep distinct IPv4 /29 and IPv6 /48 subnets routable for both ingress and egress traffic, and more than 350,000 monthly active users reach the open web through them. Every transfer is governed by a contract held in escrow and closed on a byte count both parties acknowledge, and validators independently walk operator-assigned chains of miners to prove real-time transit.</p>

                    <section className="announcement-document-section" aria-labelledby="apex-problem">
                        <h3 id="apex-problem">The optimisation problem</h3>

                        <p>Routing across an untrusted, heterogeneous fleet is a materially harder problem than routing across owned infrastructure. The Network’s published <a href="/research">protocol research</a> identifies the specific constraints. Multi-hop routing presently runs over TCP transports through a central hop. UDP transports, including HTTP/3 and DNS, are implemented but disabled owing to real-world performance results in the current configuration. A multi-provider hop with a peer-to-peer upgrade, referred to as stream, is likewise implemented but disabled, with WebRTC, XRay and WireGuard identified as candidate upgrades.</p>

                        <p>Two cases require optimisation and they trade against one another: where the next hop has no public address and port, and where it does. The second favours speed, while a combination of the two favours quality. The Network has identified the addition of metadata to the matching algorithm as a route to selecting between them, subject to preserving the property that makes matching resistant to node forgery, namely that the sum of reliability is capped at one per IP subnet.</p>

                        <p>On the client side, UR-MULTI manages a window of providers using a heuristic sweep based on transfer thresholds rather than protocol analysis, locking traffic into the top available tier. Improving that window is the single change most directly experienced by an end user.</p>
                    </section>
                </article>

                <article className="announcement-paper announcement-paper--tokenholders announcement-paper--continued" aria-label="Apex announcement, page 2">
                    <section className="announcement-document-section" aria-labelledby="apex-why">
                        <h3 id="apex-why">Why Apex</h3>

                        <p>Apex (SN1) is the original Bittensor subnet, architected by Steffen Cruz, Co-Founder and Chief Technology Officer of Macrocosmos and formerly Chief Technology Officer of the Opentensor Foundation. Given a defined problem and a benchmark, Apex outsources research and solution discovery to a competitive global network, and is specifically suited to problems with complex landscapes and many interdependent variables where a search space is best explored in parallel.</p>

                        <p>Network routing under adversarial conditions is such a problem. The objective function is measurable, the constraints are published, and the search space is large enough that no single team is well placed to explore it exhaustively. UR (SN25) will publish the benchmark, supply the datasets, and adopt validated improvements into the production protocol under its existing open-source licence.</p>
                    </section>

                    <section className="announcement-document-section" aria-labelledby="steffen-cruz">
                        <h3 id="steffen-cruz">Steffen Cruz, CTO, Macrocosmos, said:</h3>
                        <blockquote>
                            <p>“Apex was built for exactly this. A defined problem, a real objective outcome, and a search space too large for any one team to cover on its own. UR (SN25) is putting the routing layer of a network that already carries substantial production traffic in front of the whole community, and so we expect the results to be measurable in the hands of real users rather than only on a leaderboard.”</p>
                        </blockquote>
                    </section>

                    <section className="announcement-document-section" aria-labelledby="brien-colwell">
                        <h3 id="brien-colwell">Brien Colwell, Core Contributor, UR (SN25), said:</h3>
                        <blockquote>
                            <p>“We have published every algorithm in this network from the beginning, including the parts that are disabled and the reasons they are disabled. Opening the routing problem to Apex is the logical next step, because the people best placed to improve a matching algorithm are not necessarily the people who wrote it. Anything that survives the benchmark goes into production, and 100,000 miners and every user behind them feel the difference.”</p>
                        </blockquote>
                    </section>

                    <p className="announcement-legal"><em>This material is provided for informational purposes only and does not constitute an offer, solicitation or investment advice.</em></p>
                </article>
            </div>
        </div>
    );
}
