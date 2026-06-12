import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TermsSection {
  title: string;
  paragraphs: string[];
}

@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css',
})
export class TermsComponent {
  briefConditions = [
    "En commandant l'un de nos produits, vous acceptez d'être lié par ces termes et conditions.",
    'Le prix applicable est celui fixé à la date à laquelle vous passez votre commande.',
    "Les frais d'expédition et les frais de paiement sont reconnus avant de confirmer l'achat.",
    'Les informations de la carte sont transmises via un cryptage SSL sécurisé et ne sont pas stockées.',
    'Veuillez noter que des frais locaux peuvent survenir.',
    'Toutes les informations personnelles que vous nous fournissez ou que nous obtenons seront traitées par Labelle.tn en tant que responsable des informations personnelles.',
    'Labelle.tn se réserve le droit de modifier toute information sans préavis.',
    'Les événements indépendants de la volonté de Labelle.tn seront considérés comme des cas de force majeure.',
  ];

  sections: TermsSection[] = [
    {
      title: 'Politique de retour',
      paragraphs: [
        "Vous avez droit à un échange ou à un remboursement dans les 14 jours suivant votre achat. Veuillez noter que le produit doit être retourné inutilisé, dans son emballage d'origine. En cas de remboursement, ni les frais d'expédition d'origine ni les frais de retour ne seront remboursés.",
      ],
    },
    {
      title: 'Dommages et articles défectueux',
      paragraphs: [
        'Toutes les réclamations pour articles endommagés ou défectueux doivent être faites dans les 7 jours suivant la réception de votre commande.',
      ],
    },
    {
      title: 'Taxes locales',
      paragraphs: [
        'Veuillez noter que des frais locaux (taxe de vente, droits de douane) peuvent survenir en fonction de votre région et des droits de douane locaux. Ces frais sont à la charge du client.',
      ],
    },
    {
      title: 'Conditions générales',
      paragraphs: [
        "En passant une commande chez Labelle.tn, vous garantissez que vous avez au moins 18 ans (ou que vous avez l'autorisation de vos parents pour acheter chez nous) et acceptez ces termes et conditions qui s'appliquent à toutes les commandes passées ou à passer chez Labelle.tn pour la vente et la fourniture de tous produits. Aucun de ces termes et conditions n'affecte vos droits statutaires. Aucune autre condition ou modification des conditions générales ne sera contraignante, sauf accord écrit signé par nous.",
      ],
    },
    {
      title: 'Informations personnelles',
      paragraphs: [
        "Toutes les informations personnelles que vous nous fournissez ou que nous obtenons seront traitées par Labelle.tn en tant que responsable des informations personnelles. Les informations personnelles que vous fournissez seront utilisées pour assurer les livraisons chez vous, l'évaluation du crédit, et pour vous proposer des offres et des informations sur notre catalogue.",
        "Les informations que vous fournissez sont uniquement disponibles pour Labelle.tn et ne seront pas partagées avec d'autres tiers. Vous avez le droit d'inspecter les informations détenues à votre sujet. Vous avez toujours le droit de demander à Labelle.tn de supprimer ou de corriger les informations vous concernant. En acceptant les Conditions Labelle.tn, vous acceptez ce qui précède.",
      ],
    },
    {
      title: 'Paiement',
      paragraphs: [
        "Tous les produits restent la propriété de Labelle.tn jusqu'au paiement intégral du prix. Le prix applicable est celui fixé à la date à laquelle vous passez votre commande. Les frais d'expédition et les frais de paiement sont reconnus avant de confirmer l'achat. Si vous avez moins de 18 ans, vous devez avoir l'autorisation de vos parents pour acheter chez Labelle.tn.",
        "Tous les transferts effectués via Labelle.tn sont traités via des passerelles dédiées tierces pour garantir votre protection. Les informations de carte ne sont pas stockées et toutes les informations de carte sont traitées via le cryptage SSL. Veuillez lire les termes et conditions de la passerelle de paiement choisie pour la transaction car elle est responsable des transactions effectuées.",
      ],
    },
    {
      title: 'Force majeure',
      paragraphs: [
        "Les événements hors du contrôle de Labelle.tn, qui ne sont pas raisonnablement prévisibles, seront considérés comme des cas de force majeure, ce qui signifie que Labelle.tn est libéré de ses obligations de remplir les accords contractuels. Des exemples de tels événements sont une action ou une omission du gouvernement, une législation nouvelle ou modifiée, un conflit, un embargo, un incendie ou une inondation, un sabotage, un accident, une guerre, des catastrophes naturelles, des grèves ou un manque de livraison de la part des fournisseurs. La force majeure comprend également les décisions gouvernementales qui affectent négativement le marché et les produits, par exemple les restrictions, les avertissements, les interdictions, etc.",
      ],
    },
    {
      title: 'Limitation de responsabilité',
      paragraphs: [
        'Vous acceptez expressément que votre utilisation ou votre incapacité à utiliser le service se fait à vos seuls risques.',
        "En aucun cas Labelle.tn, nos administrateurs, dirigeants, employés, sociétés affiliées, agents, entrepreneurs, stagiaires, fournisseurs, prestataires de services ou concédants de licence ne pourront être tenus responsables de toute blessure, perte, réclamation ou de tout préjudice direct, indirect, accidentel, punitif, spécial ou dommages consécutifs de toute nature, y compris, sans s'y limiter, la perte de profits, la perte de revenus, la perte d'économies, la perte de données, les coûts de remplacement ou tout autre dommage similaire, découlant de votre utilisation de l'un des services ou de tout produit acheté à l'aide du service. Étant donné que certains États ou juridictions n'autorisent pas l'exclusion ou la limitation de responsabilité pour les dommages consécutifs ou accessoires, dans ces États ou juridictions, notre responsabilité sera limitée dans la mesure maximale permise par la loi.",
      ],
    },
    {
      title: 'Indemnité',
      paragraphs: [
        "Vous acceptez d'indemniser, de défendre et de tenir indemnes Labelle.tn et notre société mère, nos filiales, sociétés affiliées, partenaires, dirigeants, administrateurs, agents, entrepreneurs, concédants de licence, prestataires de services, sous-traitants, fournisseurs, stagiaires et employés, de toute réclamation ou demande, y compris les honoraires d'avocat raisonnables, payés par tout tiers en raison de ou découlant de votre violation des présentes Conditions d'utilisation ou des documents qu'ils incorporent par référence, ou de votre violation de toute loi ou des droits d'un tiers.",
      ],
    },
    {
      title: 'Cookies',
      paragraphs: [
        "Labelle.tn utilise des cookies conformément à la loi sur les communications électroniques. Un cookie est un petit fichier texte stocké sur votre ordinateur qui contient des informations permettant au site Internet d'identifier et de suivre le visiteur. Les cookies ne nuisent pas à votre ordinateur, sont constitués uniquement de texte, ne peuvent pas contenir de virus et n'occupent pratiquement aucun espace sur votre disque dur.",
        "Les « Cookies de session » : pendant que vous visitez le site Web, notre serveur Web attribue à votre navigateur une chaîne d'identification unique afin de ne pas vous confondre avec les autres visiteurs. Un « Cookie de session » n'est jamais stocké de manière permanente sur votre ordinateur et disparaît lorsque vous fermez votre navigateur. Pour utiliser Labelle.tn sans problème, vous devez activer les cookies.",
        "Les cookies permanents : ce type de cookie enregistre un fichier de manière permanente sur votre ordinateur et est utilisé pour suivre la façon dont les visiteurs se déplacent sur le site Web. Sur Labelle.tn, nous utilisons ce type de cookie pour suivre votre panier et tenir des statistiques de nos visiteurs. Les informations stockées ne constituent qu'un numéro unique, sans aucun lien avec des informations personnelles.",
      ],
    },
    {
      title: 'Informations complémentaires',
      paragraphs: [
        "Labelle.tn se réserve le droit de modifier toute information, y compris, mais sans s'y limiter, les prix, les spécifications techniques, les conditions d'achat et les offres de produits sans préavis. En cas de rupture de produit, Labelle.tn a le droit d'annuler la commande et de rembourser dans les meilleures conditions tout montant payé. Labelle.tn informera également le client des produits de remplacement équivalents si disponibles.",
      ],
    },
  ];
}
